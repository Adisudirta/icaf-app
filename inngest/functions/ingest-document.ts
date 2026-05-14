import { inngest } from "@/inngest/client";
import { embedTexts } from "@/lib/rag/embed";
import { getPineconeIndex } from "@/lib/pinecone";
import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema";
import { eq, ne } from "drizzle-orm";

const EMBED_BATCH = 100;
const UPSERT_BATCH = 100;

function batch<T>(arr: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < arr.length; i += size) batches.push(arr.slice(i, i + size));
  return batches;
}

type Chunk = { id: string; content: string };

export const ingestDocument = inngest.createFunction(
  {
    id: "ingest-document",
    triggers: { event: "rag/document.ingest" },
    onFailure: async ({ event, step }) => {
      const { documentId } = event.data.event.data as { documentId: string };
      await step.run("mark-failed", async () => {
        await db
          .update(documents)
          .set({ status: "failed" })
          .where(eq(documents.id, documentId));
      });
    },
  },
  async ({ event, step }) => {
    const { documentId } = event.data as { documentId: string };

    await step.run("cleanup-old-documents", async () => {
      const oldDocs = await db
        .select({ id: documents.id })
        .from(documents)
        .where(ne(documents.id, documentId));

      const index = getPineconeIndex();

      for (const oldDoc of oldDocs) {
        const chunkIds = await db
          .select({ id: documentChunks.id })
          .from(documentChunks)
          .where(eq(documentChunks.documentId, oldDoc.id));

        if (chunkIds.length > 0) {
          await index.deleteMany({ ids: chunkIds.map((c) => c.id) });
        }

        await db.delete(documents).where(eq(documents.id, oldDoc.id));
      }
    });

    await step.run("mark-processing", async () => {
      await db
        .update(documents)
        .set({ status: "processing" })
        .where(eq(documents.id, documentId));
    });

    const chunks = await step.run("load-chunks", async (): Promise<Chunk[]> => {
      return db
        .select({ id: documentChunks.id, content: documentChunks.content })
        .from(documentChunks)
        .where(eq(documentChunks.documentId, documentId));
    });

    const embedBatches = batch(chunks, EMBED_BATCH);
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < embedBatches.length; i++) {
      const embeddings = await step.run(`embed-batch-${i}`, async (): Promise<number[][]> => {
        return embedTexts(embedBatches[i].map((c) => c.content));
      });
      allEmbeddings.push(...embeddings);
    }

    const vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      values: allEmbeddings[i],
      metadata: { content: chunk.content, documentId },
    }));

    const index = getPineconeIndex();
    const upsertBatches = batch(vectors, UPSERT_BATCH);

    for (let i = 0; i < upsertBatches.length; i++) {
      await step.run(`upsert-pinecone-${i}`, async () => {
        await index.upsert({ records: upsertBatches[i] });
      });
    }

    await step.run("mark-complete", async () => {
      await db
        .update(documents)
        .set({ status: "ready", chunkCount: chunks.length })
        .where(eq(documents.id, documentId));
    });

    return { documentId, chunkCount: chunks.length };
  }
);
