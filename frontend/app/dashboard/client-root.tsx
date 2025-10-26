// app/dashboard/client-root.tsx  (Client Component)
"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BusinessContextProvider } from "@/contexts/business-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { JobProvider } from "@/contexts/job-context";

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1">{children}</main>
    </SidebarProvider>
  );
}

export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BusinessContextProvider>
        <JobProvider>
          <Shell>{children}</Shell>
        </JobProvider>
      </BusinessContextProvider>
    </AuthProvider>
  );
}
