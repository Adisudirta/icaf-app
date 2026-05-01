import pdfParse from "pdf-parse";

export interface Chunk {
  content: string;
  index: number;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

export async function extractAndChunkPdf(buffer: Buffer): Promise<Chunk[]> {
  const { text } = await pdfParse(buffer);
  return chunkText(text);
}

export function chunkText(text: string): Chunk[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push({ content: normalized.slice(start, end), index });
    if (end === normalized.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
    index++;
  }

  return chunks;
}
