import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { cases, promptTemplates, appSettings, userLimits } from "@/lib/db/schema";
import { openai, AI_MODEL } from "@/lib/ai";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { buildLawContextPrefix, buildAnalysisPrompt } from "@/lib/rag/prompts";
import { streamText } from "ai";
import { eq, and, inArray, gte, count } from "drizzle-orm";
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
    .where(and(eq(cases.id, caseId), eq(cases.userId, session.uid)))
    .limit(1);

  if (!caseRow) return new Response("Not found", { status: 404 });

  // ── Weekly limit check ────────────────────────────────────────────────────
  // User-specific limit takes priority; falls back to global setting, then to hardcoded default.

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
    .where(inArray(promptTemplates.key, ["law_context_prefix", "analysis_prompt"]));
  const tpl = Object.fromEntries(templateRows.map((r) => [r.key, r.body]));

  const query = `${caseRow.incidentType} ${caseRow.context} ${caseRow.victimAction}`;
  const chunks = await retrieveRelevantChunks(query, 5);

  const system = buildLawContextPrefix(chunks.map((c) => c.content), tpl["law_context_prefix"]);
  const prompt = buildAnalysisPrompt(caseRow, tpl["analysis_prompt"]);

  const result = streamText({
    model: openai(AI_MODEL),
    system,
    prompt,
    onFinish: async ({ text }) => {
      await db
        .update(cases)
        .set({ analysisText: text, analysisRunAt: new Date(), updatedAt: new Date() })
        .where(eq(cases.id, caseId));
    },
  });

  return result.toTextStreamResponse();
}
