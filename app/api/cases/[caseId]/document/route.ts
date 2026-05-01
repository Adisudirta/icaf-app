import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { openai, AI_MODEL } from "@/lib/ai";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { buildLawContextPrefix, buildDocumentPrompt } from "@/lib/rag/prompts";
import { streamText } from "ai";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { caseId } = await params;

  const [caseRow] = await db
    .select()
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.userId, session.user.id)))
    .limit(1);

  if (!caseRow) return new Response("Not found", { status: 404 });

  if (!caseRow.analysisText) {
    return Response.json(
      { error: "Analysis must be completed before generating the document" },
      { status: 400 }
    );
  }

  // Same query as analysis → same chunks → same system prefix → CAG cache hit
  const query = `${caseRow.incidentType} ${caseRow.context} ${caseRow.victimAction}`;
  const chunks = await retrieveRelevantChunks(query, 5);

  const system = buildLawContextPrefix(chunks.map((c) => c.content));
  const prompt = buildDocumentPrompt(caseRow, caseRow.analysisText);

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

  return result.toDataStreamResponse();
}
