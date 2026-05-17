import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { cases, promptTemplates, appSettings, userLimits } from "@/lib/db/schema";
import { openai, AI_MODEL } from "@/lib/ai";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { buildLawContextPrefix, buildAnalysisPrompt, buildDocumentPrompt } from "@/lib/rag/prompts";
import { streamText, generateText } from "ai";
import { eq, and, inArray, gte, count, isNull } from "drizzle-orm";
import { DEFAULT_SETTINGS, getWeekStart } from "@/lib/settings";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { caseId } = await params;

  const [caseRow] = await db
    .select()
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.userId, session.uid), isNull(cases.deletedAt)))
    .limit(1);

  if (!caseRow) return new Response("Not found", { status: 404 });

  // ── Weekly limit check ────────────────────────────────────────────────────

  const [[userLimit], [globalSetting]] = await Promise.all([
    db.select().from(userLimits).where(eq(userLimits.userId, session.uid)).limit(1),
    db.select().from(appSettings).where(eq(appSettings.key, "weekly_analysis_limit")).limit(1),
  ]);

  const weeklyLimit = userLimit?.weeklyAnalysisLimit
    ?? parseInt(globalSetting?.value ?? DEFAULT_SETTINGS.weekly_analysis_limit, 10);

  const weekStart = getWeekStart();
  const [{ usageCount }] = await db
    .select({ usageCount: count() })
    .from(cases)
    .where(
      and(
        eq(cases.userId, session.uid),
        gte(cases.analysisRunAt, weekStart)
      )
    );

  if (usageCount >= weeklyLimit) {
    return Response.json(
      {
        error: "Batas analisis mingguan tercapai",
        limit: weeklyLimit,
        used: usageCount,
      },
      { status: 429 }
    );
  }

  // ── Fetch prompt templates ────────────────────────────────────────────────

  const templateRows = await db
    .select()
    .from(promptTemplates)
    .where(inArray(promptTemplates.key, ["law_context_prefix", "analysis_prompt", "document_prompt"]));
  const tpl = Object.fromEntries(templateRows.map((r) => [r.key, r.body]));

  // Same query as analysis → same chunks → same system prefix → CAG cache hit
  const query = `${caseRow.incidentType} ${caseRow.context} ${caseRow.victimAction}`;
  const chunks = await retrieveRelevantChunks(query, 5);
  const system = buildLawContextPrefix(chunks.map((c) => c.content), tpl["law_context_prefix"]);

  // ── Generate analysis inline if not already cached ────────────────────────

  let analysisText = caseRow.analysisText;
  if (!analysisText) {
    const { text } = await generateText({
      model: openai(AI_MODEL),
      system,
      prompt: buildAnalysisPrompt(caseRow, tpl["analysis_prompt"]),
    });
    analysisText = text;
    await db
      .update(cases)
      .set({ analysisText: text, analysisRunAt: new Date(), updatedAt: new Date() })
      .where(eq(cases.id, caseId));
  }

  // ── Stream document ───────────────────────────────────────────────────────

  const result = streamText({
    model: openai(AI_MODEL),
    system,
    prompt: buildDocumentPrompt(caseRow, analysisText, tpl["document_prompt"]),
    onFinish: async ({ text }) => {
      await db
        .update(cases)
        .set({ documentText: text, updatedAt: new Date() })
        .where(eq(cases.id, caseId));
    },
  });

  return result.toTextStreamResponse();
}
