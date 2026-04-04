"use client";

import { EllipsisVertical, Plus, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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

const SidebarPage = () => {
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
                      <a href="#">
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

                        <span>ICAF</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="mb-3">
                    <SidebarMenuButton asChild>
                      <a href="#">
                        <Plus />
                        <span>Create New Cases</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#">
                        <Search />
                        <span>Search Cases</span>
                      </a>
                    </SidebarMenuButton>
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
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="rounded-xl mb-2 hover:bg-[#DCE4E8] flex justify-between items-center py-2 px-3"
                    >
                      <a href="#">
                        <span>BP/45/IV/2026/Reskrim</span>

                        <EllipsisVertical />
                      </a>
                    </SidebarMenuButton>

                    <SidebarMenuButton
                      asChild
                      className="rounded-xl mb-2 hover:bg-[#DCE4E8] flex justify-between items-center py-2 px-3"
                    >
                      <a href="#">
                        <span>BP/45/IV/2026/Reskrim</span>

                        <EllipsisVertical />
                      </a>
                    </SidebarMenuButton>

                    <SidebarMenuButton
                      asChild
                      className="rounded-xl mb-2 hover:bg-[#DCE4E8] flex justify-between items-center py-2 px-3"
                    >
                      <a href="#">
                        <span>BP/45/IV/2026/Reskrim</span>

                        <EllipsisVertical />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="bg-card sticky top-0 z-50 flex h-13.75 items-center justify-between gap-6 border-b px-4 py-2 sm:px-6">
            <SidebarTrigger className="[&_svg]:size-5!" />
          </header>
          <main className="size-full flex-1 px-4 py-6 sm:px-6">
            <Card className="h-250">
              <CardContent className="h-full">
                <div className="border-card-foreground/10 h-full rounded-md border bg-[repeating-linear-gradient(45deg,color-mix(in_oklab,var(--card-foreground)10%,transparent),color-mix(in_oklab,var(--card-foreground)10%,transparent)_1px,var(--card)_2px,var(--card)_15px)]" />
              </CardContent>
            </Card>
          </main>
          <footer className="bg-card h-10 border-t px-4 sm:px-6">
            <div className="border-card-foreground/10 h-full bg-[repeating-linear-gradient(45deg,color-mix(in_oklab,var(--card-foreground)10%,transparent),color-mix(in_oklab,var(--card-foreground)10%,transparent)_1px,var(--card)_2px,var(--card)_15px)]" />
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SidebarPage;
