import { getServerSession } from "@/lib/session";
import { extractAndChunkPdf } from "@/lib/rag/chunk";
import { embedTexts } from "@/lib/rag/embed";
import { getPineconeIndex } from "@/lib/pinecone";
import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const EMBED_BATCH = 100;  // OpenAI embedMany safe limit
const UPSERT_BATCH = 100; // Pinecone upsert limit per call

function batch<T>(arr: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < arr.length; i += size) batches.push(arr.slice(i, i + size));
  return batches;
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
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
    console.log(`[ingest] ${file.name}: ${chunks.length} chunks`);

    if (chunks.length === 0) {
      results.push({ fileName: file.name, chunkCount: 0, skipped: true });
      continue;
    }

    const documentId = crypto.randomUUID();
    await db.insert(documents).values({
      id: documentId,
      fileName: file.name,
      chunkCount: 0,
    });

    // Embed in batches to stay within OpenAI's request limits
    const allEmbeddings: number[][] = [];
    for (const b of batch(chunks.map((c) => c.content), EMBED_BATCH)) {
      const batchResult = await embedTexts(b);
      allEmbeddings.push(...batchResult);
    }

    const chunkRows = chunks.map((chunk, i) => ({
      id: crypto.randomUUID(),
      documentId,
      chunkIndex: chunk.index,
      content: chunk.content,
      _embedding: allEmbeddings[i],
    }));

    // Insert metadata rows to Neon (batch to avoid hitting statement size limits)
    for (const b of batch(chunkRows, 500)) {
      await db.insert(documentChunks).values(
        b.map(({ _embedding: _, ...row }) => row)
      );
    }

    // Upsert to Pinecone in batches of 100
    const index = getPineconeIndex();
    for (const b of batch(chunkRows, UPSERT_BATCH)) {
      await index.upsert({
        records: b.map((row) => ({
          id: row.id,
          values: row._embedding,
          metadata: { content: row.content, documentId, chunkIndex: row.chunkIndex },
        })),
      });
    }

    await db
      .update(documents)
      .set({ chunkCount: chunks.length })
      .where(eq(documents.id, documentId));

    results.push({ documentId, fileName: file.name, chunkCount: chunks.length });
  }

  return Response.json({ results });
}
