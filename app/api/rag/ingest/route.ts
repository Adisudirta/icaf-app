import { auth } from "@/lib/auth";
import { extractAndChunkPdf } from "@/lib/rag/chunk";
import { embedTexts } from "@/lib/rag/embed";
import { getPineconeIndex } from "@/lib/pinecone";
import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return Response.json({ error: "No files provided" }, { status: 400 });
  }

  const results = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const chunks = await extractAndChunkPdf(buffer);

    const documentId = crypto.randomUUID();
    await db.insert(documents).values({
      id: documentId,
      fileName: file.name,
      chunkCount: 0,
    });

    const embeddings = await embedTexts(chunks.map((c) => c.content));

    const chunkRows = chunks.map((chunk, i) => ({
      id: crypto.randomUUID(),
      documentId,
      chunkIndex: chunk.index,
      content: chunk.content,
    }));

    await db.insert(documentChunks).values(chunkRows);

    const index = getPineconeIndex();
    await index.upsert(
      chunkRows.map((row, i) => ({
        id: row.id,
        values: embeddings[i],
        metadata: {
          content: row.content,
          documentId,
          chunkIndex: chunks[i].index,
        },
      }))
    );

    await db
      .update(documents)
      .set({ chunkCount: chunks.length })
      .where(eq(documents.id, documentId));

    results.push({ documentId, fileName: file.name, chunkCount: chunks.length });
  }

  return Response.json({ results });
}
