import { embed, embedMany } from "ai";
import { openai, EMBED_MODEL } from "@/lib/ai";

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBED_MODEL),
    value: text,
  });
  return embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: openai.embedding(EMBED_MODEL),
    values: texts,
  });
  return embeddings;
}
