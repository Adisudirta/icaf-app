import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { cases, promptTemplates } from "@/lib/db/schema";
import { openai, AI_MODEL } from "@/lib/ai";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { buildLawContextPrefix, buildDocumentPrompt } from "@/lib/rag/prompts";
import { streamText } from "ai";
import { eq, and, inArray } from "drizzle-orm";

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

  if (!caseRow.analysisText) {
    return Response.json(
      { error: "Analysis must be completed before generating the document" },
      { status: 400 }
    );
  }

  const templateRows = await db
    .select()
    .from(promptTemplates)
    .where(inArray(promptTemplates.key, ["law_context_prefix", "document_prompt"]));
  const tpl = Object.fromEntries(templateRows.map((r) => [r.key, r.body]));

  // Same query as analysis → same chunks → same system prefix → CAG cache hit
  const query = `${caseRow.incidentType} ${caseRow.context} ${caseRow.victimAction}`;
  const chunks = await retrieveRelevantChunks(query, 5);

  const system = buildLawContextPrefix(chunks.map((c) => c.content), tpl["law_context_prefix"]);
  const prompt = buildDocumentPrompt(caseRow, caseRow.analysisText, tpl["document_prompt"]);

  const result = streamText({
    model: openai(AI_MODEL),
    system,
    prompt,
    onFinish: async ({ text }) => {
      await db
        .update(cases)
        .set({ documentText: text, updatedAt: new Date() })
        .where(eq(cases.id, caseId));
    },
  });

  return result.toTextStreamResponse();
}
