import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<Response> {
  const session = await getServerSession(await headers());
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { caseId } = await params;

  const [row] = await db
    .select({ analysisText: cases.analysisText, documentText: cases.documentText })
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.userId, session.uid), isNull(cases.deletedAt)))
    .limit(1);

  if (!row) return new Response("Not found", { status: 404 });

  return Response.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<Response> {
  const session = await getServerSession(await headers());
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { caseId } = await params;

  const updated = await db
    .update(cases)
    .set({ deletedAt: new Date() })
    .where(and(eq(cases.id, caseId), eq(cases.userId, session.uid), isNull(cases.deletedAt)))
    .returning({ id: cases.id });

  if (!updated.length) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(null, { status: 204 });
}
