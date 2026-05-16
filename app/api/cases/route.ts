import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { cases, appSettings, userLimits } from "@/lib/db/schema";
import { eq, count, gte, and } from "drizzle-orm";
import { z } from "zod";
import { DEFAULT_SETTINGS, getWeekStart } from "@/lib/settings";

const schema = z.object({
  caseName: z.string().min(1),
  incidentDate: z.string().min(1),
  investigatingOfficer: z.string().min(1),
  incidentLocation: z.string().min(1),
  incidentType: z.string().min(1),
  threatType: z.string().min(1),
  victimAction: z.string().min(1),
  outcome: z.string().min(1),
  context: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(request.headers as Headers);
  if (!session) return new Response("Unauthorized", { status: 401 });

  // ── Weekly limit check ────────────────────────────────────────────────────

  const [[userLimit], [globalSetting], [{ usedCount }]] = await Promise.all([
    db.select().from(userLimits).where(eq(userLimits.userId, session.uid)).limit(1),
    db.select().from(appSettings).where(eq(appSettings.key, "weekly_analysis_limit")).limit(1),
    db
      .select({ usedCount: count() })
      .from(cases)
      .where(and(eq(cases.userId, session.uid), gte(cases.createdAt, getWeekStart()))),
  ]);

  const weeklyLimit =
    userLimit?.weeklyAnalysisLimit ??
    parseInt(globalSetting?.value ?? DEFAULT_SETTINGS.weekly_analysis_limit, 10);

  if (usedCount >= weeklyLimit) {
    return Response.json(
      { error: "Batas analisis mingguan tercapai", limit: weeklyLimit, used: usedCount },
      { status: 429 }
    );
  }

  // ── Create case ───────────────────────────────────────────────────────────

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const caseId = crypto.randomUUID();
  await db.insert(cases).values({
    id: caseId,
    userId: session.uid,
    ...parsed.data,
  });

  return Response.json({ caseId });
}
