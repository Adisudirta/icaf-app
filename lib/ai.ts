import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const AI_MODEL = process.env.AI_MODEL ?? "gpt-4o";
export const EMBED_MODEL = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
