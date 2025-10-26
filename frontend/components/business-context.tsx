"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BusinessContextType = {
  id: string;
  name: string;
  content: string;
};

type BusinessContextProps = {
  initialValue?: { name: string; content: string };
  onSave: (context: { name: string; content: string }) => void;
  isOpen: boolean;
  onClose: () => void;
};

export function BusinessContext({
  initialValue = { name: "", content: "" },
  onSave,
  isOpen,
  onClose,
}: BusinessContextProps) {
  const [name, setName] = useState(initialValue.name);
  const [content, setContent] = useState(initialValue.content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialValue.name);
      setContent(initialValue.content);
      setHasChanges(false);
    }
  }, [isOpen, initialValue.name, initialValue.content]);

  const handleSave = () => {
    onSave({ name, content });
    onClose();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setHasChanges(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out">
      <div className="border-b border-border p-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Business Context</h3>
          <p className="text-sm text-muted-foreground">
            Add context about your business for consistent content
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 -mr-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <Label htmlFor="context-name">Business Name</Label>
          <Input
            id="context-name"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g., My Awesome Startup"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="context-content">Business Context</Label>
          <Textarea
            id="context-content"
            value={content}
            onChange={handleChange}
            placeholder="Enter your business context here..."
            className="h-full min-h-[300px] resize-none mt-1"
          />
        </div>
      </div>
      <div className="border-t border-border p-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
