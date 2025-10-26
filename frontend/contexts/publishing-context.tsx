"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { Tables } from "@/database.types";

// Local type for the "publishing" table row
export type PublishingRow = Tables<"publishing">;

type PublishingContextValue = {
  data: PublishingRow[] | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const PublishingContext = createContext<PublishingContextValue | undefined>(
  undefined
);

export function PublishingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<PublishingRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPublishing = useCallback(async () => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("publishing")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching publishing data:", error);
        setData(null);
      } else {
        console.log("Raw data", data);
        setData((data as PublishingRow[]) ?? []);
      }
    } catch (err) {
      console.error("Unexpected error fetching publishing data:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (!authLoading) {
      void fetchPublishing();
    }
  }, [authLoading, fetchPublishing]);

  const value = useMemo(
    () => ({ data, loading, refetch: fetchPublishing }),
    [data, loading, fetchPublishing]
  );

  return (
    <PublishingContext.Provider value={value}>
      {children}
    </PublishingContext.Provider>
  );
}

export function usePublishing() {
  const context = useContext(PublishingContext);
  if (context === undefined) {
    throw new Error("usePublishing must be used within a PublishingProvider");
  }
  return context;
}
