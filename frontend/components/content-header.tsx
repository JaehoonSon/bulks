"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown } from "lucide-react";
import { useBusinessContext } from "@/contexts/business-context";
import BusinessContextButton from "@/components/business-context-button";
import { SidebarTrigger } from "./ui/sidebar";

type ContentHeaderProps = {
  title: string;
  description: string;
  onBusinessContextSelect: (contextId: string | null) => void;
  selectedBusinessContext?: string | null;
};

export function ContentHeader({ title, description }: ContentHeaderProps) {
  const { selectContext } = useBusinessContext();

  // Allow other components (e.g., pages) to open the header's context selector/modal
  useEffect(() => {
    // no-op; kept window event pattern in button component
  }, []);

  return (
    <div className="max-w-full space-y-4 pb-3 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* <div className="flex items-center space-x-2">
          <BusinessContextButton />
        </div> */}
      </div>
    </div>
  );
}
