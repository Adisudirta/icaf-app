import { getPineconeIndex } from "@/lib/pinecone";
import { embedText } from "./embed";

export interface RetrievedChunk {
  content: string;
  similarity: number;
}

export async function retrieveRelevantChunks(
  query: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query);
  const index = getPineconeIndex();

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return result.matches
    .filter((m) => m.metadata?.content)
    .map((m) => ({
      content: m.metadata!.content as string,
      similarity: m.score ?? 0,
    }));
}
