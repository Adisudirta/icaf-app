import BaseLayout from "@/components/layout/base-layout";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(await headers());

  const recentCases = session
    ? await db
        .select({ id: cases.id, caseNumber: cases.caseNumber })
        .from(cases)
        .where(eq(cases.userId, session.uid))
        .orderBy(desc(cases.createdAt))
        .limit(10)
    : [];

  return (
    <BaseLayout
      user={
        session
          ? { name: session.name ?? "", email: session.email ?? "" }
          : null
      }
      recentCases={recentCases}
    >
      {children}
    </BaseLayout>
  );
}
