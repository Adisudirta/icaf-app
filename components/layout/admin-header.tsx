"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 h-13.75 bg-card ring-1 ring-foreground/10 flex items-center justify-between px-6">
      <span className="font-semibold text-sm">ICAF Admin</span>
      <div className="flex items-center gap-3">
        {session?.user?.email && (
          <span className="text-sm text-muted-foreground hidden sm:block">
            {session.user.email}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
