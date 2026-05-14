import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const rows = await db
    .select()
    .from(documents)
    .orderBy(desc(documents.uploadedAt))
    .limit(1);

  const doc = rows[0] ?? null;
  return Response.json(doc);
}
