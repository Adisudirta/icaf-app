import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { userLimits } from "@/lib/db/schema";
import { adminAuth } from "@/lib/firebase-admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const rows = await db.select().from(userLimits).orderBy(userLimits.updatedAt);
  return NextResponse.json(rows);
}

export async function PUT(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { email, limit } = await request.json();

  if (typeof email !== "string" || !email.includes("@")) {
    return new Response("Invalid email", { status: 400 });
  }
  const parsed = parseInt(limit, 10);
  if (isNaN(parsed) || parsed < 1) {
    return new Response("Invalid limit", { status: 400 });
  }

  let firebaseUser;
  try {
    firebaseUser = await adminAuth.getUserByEmail(email);
  } catch {
    return new Response("User not found", { status: 404 });
  }

  await db
    .insert(userLimits)
    .values({
      userId: firebaseUser.uid,
      email: firebaseUser.email ?? email,
      weeklyAnalysisLimit: parsed,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userLimits.userId,
      set: {
        email: firebaseUser.email ?? email,
        weeklyAnalysisLimit: parsed,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { userId } = await request.json();
  if (typeof userId !== "string") return new Response("Invalid userId", { status: 400 });

  await db.delete(userLimits).where(eq(userLimits.userId, userId));
  return NextResponse.json({ ok: true });
}
