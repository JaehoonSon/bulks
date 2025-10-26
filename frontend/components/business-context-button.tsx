"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useBusinessContext } from "@/contexts/business-context";
import { BusinessContext as BusinessContextDrawer } from "@/components/business-context";

export default function BusinessContextButton() {
  const {
    contexts,
    selectedContext,
    addContext,
    updateContext,
    removeContext,
    selectContext,
  } = useBusinessContext();

  const [open, setOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const selected = selectedContext ?? null;

  // Allow other parts of the app to open the selector or new context UI
  useEffect(() => {
    const openSelector = () => setOpen(true);
    const openCreate = () => {
      selectContext(null);
      setIsDrawerOpen((prev) => !prev);
    };
    window.addEventListener("open-business-context-selector", openSelector);
    window.addEventListener("open-business-context-create", openCreate);
    return () => {
      window.removeEventListener(
        "open-business-context-selector",
        openSelector
      );
      window.removeEventListener("open-business-context-create", openCreate);
    };
  }, [selectContext]);

  const handleSave = (data: { name: string; content: string }) => {
    if (!data.name.trim() || !data.content.trim()) return;
    if (selected) {
      updateContext(selected.id, data);
    } else {
      const created = addContext({ name: data.name, content: data.content });
      selectContext(created.id);
    }
    setIsDrawerOpen(false);
  };

  return (
    <div>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {selected ? selected.name : "Select Business Context"}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64"
          align="end"
          sideOffset={5}
          collisionPadding={10}
          side="bottom"
        >
          <DropdownMenuLabel>Business Context</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              selectContext(null);
              setIsDrawerOpen(true);
              setOpen(false);
            }}
            className="cursor-pointer flex items-center p-3 hover:bg-accent"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="font-medium">Create New Context</span>
          </DropdownMenuItem>
          {contexts.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Saved Contexts ({contexts.length}):
              </div>
              {contexts.map((context) => (
                <DropdownMenuItem
                  key={context.id}
                  onSelect={() => {
                    selectContext(context.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer justify-between"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{context.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-48">
                      {context.content.substring(0, 8)}
                      {context.content.length > 8 ? "..." : ""}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectContext(context.id);
                        setIsDrawerOpen(true);
                        setOpen(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeContext(context.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  selectContext(null);
                  setOpen(false);
                }}
                className="cursor-pointer text-muted-foreground"
              >
                Clear Selection
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <BusinessContextDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
        initialValue={
          selected
            ? { name: selected.name, content: selected.content }
            : undefined
        }
      />
    </div>
  );
}
