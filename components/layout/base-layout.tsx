"use client";

import { EllipsisVertical, LogOut, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";
import { firebaseSignOut, signInWithGoogle } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BaseLayoutProps {
  children: React.ReactNode;
  user?: { name: string; email: string; image?: string | null } | null;
  recentCases?: { id: string; caseNumber: string }[];
}

export default function BaseLayout({
  children,
  user,
  recentCases = [],
}: BaseLayoutProps) {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");

  async function handleSignIn() {
    setSignInError("");
    setSigningIn(true);
    try {
      await signInWithGoogle();
      router.refresh();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      if (raw.includes("popup-closed-by-user") || raw.includes("cancelled-popup-request")) {
        setSignInError("Cancelled.");
      } else if (raw.includes("popup-blocked")) {
        setSignInError("Pop-up blocked — please allow pop-ups.");
      } else {
        setSignInError("Sign-in failed. Please try again.");
      }
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    await firebaseSignOut();
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className="mb-6">
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <div className="flex justify-center items-center bg-primary w-6 h-6 rounded-sm">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0 14.25V12.75H6.75V4.36875C6.425 4.25625 6.14375 4.08125 5.90625 3.84375C5.66875 3.60625 5.49375 3.325 5.38125 3H3L5.25 8.25C5.25 8.875 4.99375 9.40625 4.48125 9.84375C3.96875 10.2812 3.35 10.5 2.625 10.5C1.9 10.5 1.28125 10.2812 0.76875 9.84375C0.25625 9.40625 0 8.875 0 8.25L2.25 3H0.75V1.5H5.38125C5.53125 1.0625 5.8 0.703125 6.1875 0.421875C6.575 0.140625 7.0125 0 7.5 0C7.9875 0 8.425 0.140625 8.8125 0.421875C9.2 0.703125 9.46875 1.0625 9.61875 1.5H14.25V3H12.75L15 8.25C15 8.875 14.7437 9.40625 14.2312 9.84375C13.7188 10.2812 13.1 10.5 12.375 10.5C11.65 10.5 11.0312 10.2812 10.5188 9.84375C10.0063 9.40625 9.75 8.875 9.75 8.25L12 3H9.61875C9.50625 3.325 9.33125 3.60625 9.09375 3.84375C8.85625 4.08125 8.575 4.25625 8.25 4.36875V12.75H15V14.25H0ZM10.9688 8.25H13.7812L12.375 4.9875L10.9688 8.25ZM1.21875 8.25H4.03125L2.625 4.9875L1.21875 8.25ZM7.5 3C7.7125 3 7.89062 2.92812 8.03438 2.78437C8.17813 2.64062 8.25 2.4625 8.25 2.25C8.25 2.0375 8.17813 1.85938 8.03438 1.71563C7.89062 1.57188 7.7125 1.5 7.5 1.5C7.2875 1.5 7.10938 1.57188 6.96562 1.71563C6.82187 1.85938 6.75 2.0375 6.75 2.25C6.75 2.4625 6.82187 2.64062 6.96562 2.78437C7.10938 2.92812 7.2875 3 7.5 3Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                        <span className="font-bold font-crimson-text text-xl">
                          ICAF
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="mb-3">
                    <SidebarMenuButton asChild>
                      <Link href="/create">
                        <Plus />
                        <span>Create New Cases</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <ButtonGroup>
                      <Input
                        id="input-button-group"
                        placeholder="Search cases"
                      />
                      <Button variant="outline">Search</Button>
                    </ButtonGroup>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-[#94A3B8] font-bold tracking-[2px] text-[10px]">
                RECENT CASES
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {recentCases.length === 0 ? (
                    <SidebarMenuItem>
                      <p className="px-3 py-2 text-xs text-muted-foreground">
                        No cases yet
                      </p>
                    </SidebarMenuItem>
                  ) : (
                    recentCases.map((c) => (
                      <SidebarMenuItem key={c.id}>
                        <SidebarMenuButton
                          asChild
                          className="rounded-xl mb-2 hover:bg-[#DCE4E8] flex justify-between items-center py-2 px-3"
                        >
                          <Link href={`/analysis?caseId=${c.id}`}>
                            <span className="truncate">{c.caseNumber}</span>
                            <EllipsisVertical className="shrink-0" />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="bg-card sticky top-0 z-50 flex h-13.75 items-center justify-between gap-6 border-b px-4 py-2 sm:px-6">
            <SidebarTrigger className="[&_svg]:size-5!" />

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-48">
                    {user.name || user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {signInError && (
                    <span className="text-xs text-destructive hidden sm:block">
                      {signInError}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="gap-2"
                  >
                    {signingIn ? (
                      <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    {signingIn ? "Signing in…" : "Sign in with Google"}
                  </Button>
                </div>
              )}
            </div>
          </header>

          <main className="size-full flex-1 px-4 py-6 sm:px-6 h-[calc(100dvh-55px-40px)] bg-[#F5F5F5]">
            {children}
          </main>

          <footer className="bg-card h-10 border-t px-4 sm:px-6 flex items-center justify-center">
            <span className="text-sm">
              Copyright &copy; 2024. All rights reserved.
            </span>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
}
