"use client";

import { EllipsisVertical, LogOut, Plus, Trash2, X } from "lucide-react";
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
import { Button } from "../ui/button";
import { firebaseSignOut, signInWithGoogle } from "@/lib/auth-client";
import { AuthContext } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface BaseLayoutProps {
  children: React.ReactNode;
  user?: { name: string; email: string; image?: string | null } | null;
  recentCases?: {
    id: string;
    caseName: string;
    hasAnalysis: boolean;
    hasDocument: boolean;
  }[];
  weeklyUsed?: number;
  weeklyLimit?: number;
}

export default function BaseLayout({
  children,
  user,
  recentCases = [],
  weeklyUsed = 0,
  weeklyLimit = 5,
}: BaseLayoutProps) {
  const weeklyLimitReached = weeklyUsed >= weeklyLimit;
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [caseList, setCaseList] = useState(recentCases);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCaseList(recentCases);
  }, [recentCases]);

  async function handleDelete(caseId: string) {
    setDeletingId(caseId);
    const next = caseList.filter((c) => c.id !== caseId);
    setCaseList(next);
    try {
      await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
      if (next.length === 0) {
        router.push("/");
      } else {
        router.refresh();
      }
    } catch {
      setCaseList(recentCases);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSignIn() {
    setSignInError("");
    setSigningIn(true);
    try {
      await signInWithGoogle();
      setShowSignInModal(false);
      router.refresh();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      if (
        raw.includes("popup-closed-by-user") ||
        raw.includes("cancelled-popup-request")
      ) {
        setSignInError("Cancelled.");
      } else if (raw.includes("popup-blocked")) {
        setSignInError("Pop-up blocked — please allow pop-ups.");
      } else {
        setSignInError("Sign-in failed. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    await firebaseSignOut();
    router.refresh();
  }

  function handleCreateClick() {
    if (!user) {
      setSignInError("");
      setShowSignInModal(true);
    } else {
      router.push("/create");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        signIn: () => handleSignIn(),
        openSignInModal: () => {
          setSignInError("");
          setShowSignInModal(true);
        },
        weeklyLimitReached,
        openLimitModal: () => setShowLimitModal(true),
      }}
    >
      <div className="flex min-h-dvh w-full">
        <SidebarProvider>
          <Sidebar className="print:hidden">
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
                      <SidebarMenuButton onClick={handleCreateClick}>
                        <Plus />
                        <span>Create New Cases</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <Input
                        placeholder="Search cases"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
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
                    {(() => {
                      const filtered = searchQuery.trim()
                        ? caseList.filter((c) =>
                            c.caseName
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                          )
                        : caseList;
                      return filtered.length === 0 ? (
                        <SidebarMenuItem>
                          <p className="px-3 py-2 text-xs text-muted-foreground">
                            {searchQuery.trim()
                              ? "No cases found."
                              : "No cases yet"}
                          </p>
                        </SidebarMenuItem>
                      ) : (
                        <>
                          {filtered.map((c) => (
                            <CaseItem
                              key={c.id}
                              caseId={c.id}
                              caseName={c.caseName}
                              href={`/review?caseId=${c.id}`}
                              deleting={deletingId === c.id}
                              onDelete={handleDelete}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <div className="flex flex-1 flex-col">
            <header className="bg-card sticky top-0 z-50 flex h-13.75 items-center justify-between gap-6 border-b px-4 py-2 sm:px-6 print:hidden">
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
                      onClick={() => handleSignIn()}
                      disabled={signingIn}
                      className="gap-2"
                    >
                      {signingIn ? (
                        <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="size-3.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
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

            <footer className="bg-card h-10 border-t px-4 sm:px-6 flex items-center justify-center print:hidden">
              <span className="text-sm">
                Copyright &copy; 2024. All rights reserved.
              </span>
            </footer>
          </div>
        </SidebarProvider>
      </div>

      {/* ── Sign-in modal ───────────────────────────────────────── */}
      {showSignInModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSignInModal(false)}
        >
          <div
            className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex justify-center items-center bg-primary w-10 h-10 rounded-xl">
              <svg
                width="20"
                height="20"
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

            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">
                Sign in to continue
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                You need to sign in to create and manage cases.
              </p>
            </div>

            {signInError && (
              <p className="text-sm text-destructive text-center">
                {signInError}
              </p>
            )}

            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={() => handleSignIn()}
              disabled={signingIn}
            >
              {signingIn ? (
                <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {signingIn ? "Signing in…" : "Sign in with Google"}
            </Button>
          </div>
        </div>
      )}
      {/* ── Limit reached modal ─────────────────────────────────────── */}
      {showLimitModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowLimitModal(false);
            router.push("/");
          }}
        >
          <div
            className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowLimitModal(false);
                router.push("/");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex justify-center items-center bg-amber-100 w-10 h-10 rounded-xl">
              <svg
                viewBox="0 0 24 24"
                className="size-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">
                Batas Mingguan Tercapai
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Limit anda adalah{" "}
                <span className="font-semibold text-gray-700">
                  {weeklyLimit} analisis hukum
                </span>{" "}
                per minggu.
              </p>
            </div>

            <div className="w-full bg-amber-50 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-amber-700 font-medium">
                Dapat membuat analisis baru mulai
              </p>
              <p className="text-sm font-semibold text-amber-900 mt-0.5">
                {(() => {
                  const now = new Date();
                  const day = now.getUTCDay();
                  const next = new Date(now);
                  next.setUTCDate(now.getUTCDate() + (day === 0 ? 1 : 8 - day));
                  next.setUTCHours(0, 0, 0, 0);
                  return new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(next);
                })()}
              </p>
            </div>

            <button
              onClick={() => {
                router.push("/");
                setShowLimitModal(false);
              }}
              className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

function CaseItem({
  caseId,
  caseName,
  href,
  deleting,
  onDelete,
}: {
  caseId: string;
  caseName: string;
  href: string;
  deleting: boolean;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const isActive = searchParams.get("caseId") === caseId;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <SidebarMenuItem className="relative">
      <div className={`group rounded-xl mb-2 flex items-center py-2 px-3 gap-1 ${isActive ? "bg-[#DCE4E8]" : "hover:bg-[#DCE4E8]"}`}>
        <Link href={href} className="flex-1 min-w-0 text-sm truncate">
          {caseName}
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
          disabled={deleting}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          {deleting ? (
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
          ) : (
            <EllipsisVertical className="size-4" />
          )}
        </button>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="absolute left-2 right-2 z-50 mt-0.5 rounded-lg border bg-popover shadow-md py-1"
          style={{ top: "100%" }}
        >
          <button
            onClick={() => {
              setOpen(false);
              onDelete(caseId);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="size-4" />
            Hapus Kasus
          </button>
        </div>
      )}
    </SidebarMenuItem>
  );
}
