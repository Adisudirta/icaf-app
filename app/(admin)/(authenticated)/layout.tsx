import AdminHeader from "@/components/layout/admin-header";
import { getAdminSession } from "@/lib/session";
import { headers } from "next/headers";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession(await headers());

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <AdminHeader email={session?.email} />
      {children}
    </div>
  );
}
