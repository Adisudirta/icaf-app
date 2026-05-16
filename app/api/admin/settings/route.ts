import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import {
  SETTING_KEYS,
  DEFAULT_SETTINGS,
  type SettingKey,
} from "@/lib/settings";

export async function GET(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const rows = await db.select().from(appSettings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const result = Object.fromEntries(
    SETTING_KEYS.map((key) => [key, map[key] ?? DEFAULT_SETTINGS[key]])
  );

  return NextResponse.json(result);
}

export async function PUT(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { key, value } = await request.json();

  if (!SETTING_KEYS.includes(key as SettingKey) || typeof value !== "string") {
    return new Response("Invalid key or value", { status: 400 });
  }

  await db
    .insert(appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}
