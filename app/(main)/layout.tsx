import BaseLayout from "@/components/layout/base-layout";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { cases, appSettings, userLimits } from "@/lib/db/schema";
import { eq, desc, sql, count, gte, and } from "drizzle-orm";
import { headers } from "next/headers";
import { DEFAULT_SETTINGS, getWeekStart } from "@/lib/settings";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(await headers());

  const [recentCases, weeklyUsage] = await Promise.all([
    session
      ? db
          .select({
            id: cases.id,
            caseName: cases.caseName,
            hasAnalysis: sql<boolean>`${cases.analysisText} is not null`,
            hasDocument: sql<boolean>`${cases.documentText} is not null`,
          })
          .from(cases)
          .where(eq(cases.userId, session.uid))
          .orderBy(desc(cases.createdAt))
          .limit(10)
      : Promise.resolve([]),

    session
      ? (async () => {
          const [[userLimit], [globalSetting], [{ usedCount }]] = await Promise.all([
            db.select().from(userLimits).where(eq(userLimits.userId, session.uid)).limit(1),
            db.select().from(appSettings).where(eq(appSettings.key, "weekly_analysis_limit")).limit(1),
            db
              .select({ usedCount: count() })
              .from(cases)
              .where(and(eq(cases.userId, session.uid), gte(cases.createdAt, getWeekStart()))),
          ]);
          const limit =
            userLimit?.weeklyAnalysisLimit ??
            parseInt(globalSetting?.value ?? DEFAULT_SETTINGS.weekly_analysis_limit, 10);
          return { used: usedCount, limit };
        })()
      : Promise.resolve({ used: 0, limit: parseInt(DEFAULT_SETTINGS.weekly_analysis_limit, 10) }),
  ]);

  return (
    <BaseLayout
      user={
        session
          ? { name: session.name ?? "", email: session.email ?? "" }
          : null
      }
      recentCases={recentCases}
      weeklyUsed={weeklyUsage.used}
      weeklyLimit={weeklyUsage.limit}
    >
      {children}
    </BaseLayout>
  );
}
