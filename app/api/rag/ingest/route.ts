import { getServerSession } from "@/lib/session";
import { extractAndChunkPdf } from "@/lib/rag/chunk";
import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema";
import { inngest } from "@/inngest/client";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return Response.json({ error: "No files provided" }, { status: 400 });
  }

  if (files.length > 1) {
    return Response.json({ error: "Only one document can be ingested at a time" }, { status: 400 });
  }

  const file = files[0];
  const buffer = Buffer.from(await file.arrayBuffer());
  const chunks = await extractAndChunkPdf(buffer);
  console.log(`[ingest] ${file.name}: ${chunks.length} chunks`);

  if (chunks.length === 0) {
    return Response.json({ error: "No text could be extracted from the file" }, { status: 422 });
  }

  const documentId = crypto.randomUUID();

  await db.insert(documents).values({
    id: documentId,
    fileName: file.name,
    chunkCount: 0,
  });

  await db.insert(documentChunks).values(
    chunks.map((chunk) => ({
      id: crypto.randomUUID(),
      documentId,
      chunkIndex: chunk.index,
      content: chunk.content,
    }))
  );

  await inngest.send({
    name: "rag/document.ingest",
    data: { documentId },
  });

  return Response.json({ documentId, fileName: file.name, status: "processing" }, { status: 202 });
}
