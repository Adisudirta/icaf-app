import AdminHeader from "@/components/layout/admin-header";
import { getServerSession } from "@/lib/session";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(await headers());

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <AdminHeader email={session?.email} />
      {children}
    </div>
  );
}
