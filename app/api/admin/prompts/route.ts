import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { promptTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  PROMPT_KEYS,
  DEFAULT_TEMPLATES,
  type PromptKey,
} from "@/lib/rag/prompts";

export async function GET(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const rows = await db.select().from(promptTemplates);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.body]));

  const result = Object.fromEntries(
    PROMPT_KEYS.map((key) => [key, map[key] ?? DEFAULT_TEMPLATES[key]])
  );

  return NextResponse.json(result);
}

export async function PUT(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { key, body } = await request.json();

  if (!PROMPT_KEYS.includes(key as PromptKey) || typeof body !== "string") {
    return new Response("Invalid key or body", { status: 400 });
  }

  await db
    .insert(promptTemplates)
    .values({ key, body, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: promptTemplates.key,
      set: { body, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}
