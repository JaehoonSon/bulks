"use client";

import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BusinessContextProvider } from "@/contexts/business-context";
import { useAuth } from "@/contexts/auth-context";
import { JobProvider } from "@/contexts/job-context";
import { AccountsProvider } from "@/contexts/accounts-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BusinessContextButton from "@/components/business-context-button";
import { Separator } from "@/components/ui/separator";
import { DialogProvider } from "@/components/dialogs/dialog-provider";
import { PublishingProvider } from "@/contexts/publishing-context";

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 max-w-full min-w-0 overflow-hidden">
          <div className="flex flex-row items-center min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="hidden md:flex space-x-2 flex-1 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/carousel">Create Carousel</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/video">Create Video</Link>
            </Button>
          </div>
          <div className="shrink-0">
            <BusinessContextButton />
          </div>
        </header>
        <div className="flex-1 overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <JobProvider>
      <BusinessContextProvider>
        <PublishingProvider>
          <AccountsProvider>
            <DialogProvider>
              <Shell>{children}</Shell>
            </DialogProvider>
          </AccountsProvider>
        </PublishingProvider>
      </BusinessContextProvider>
    </JobProvider>
  );
}
