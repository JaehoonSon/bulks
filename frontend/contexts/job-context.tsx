"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { type Tables } from "@/database.types";
import { useAuth } from "@/contexts/auth-context";
import {
  CarouselModelResponse,
  CarouselObjectType,
  DefaultJobResult,
  JobStatus,
  VideoModelResponse,
  VideoObjectType,
} from "@/hooks/models";

type Job = Tables<"jobs">;

type JobContextType = {
  jobs: Job[] | null;
  flattenedRows: FlattenedRow[];
  loading: boolean;
  refreshJobs: () => Promise<void>;
};

type FlattenedRow = {
  id: string; // original id + index
  status: JobStatus;
  job_type: string;
  created_at: string;
  updated_at: string;
  result: CarouselObjectType | VideoObjectType | null;
};

function flattenJobs(data: Job[] | null): FlattenedRow[] {
  if (!data) return [];

  return data.flatMap((r) => {
    if (["failed", "started", "queued"].includes(r.status)) {
      return {
        id: r.id,
        status: r.status as JobStatus,
        job_type: r.job_type,
        created_at: r.created_at,
        updated_at: r.finished_at ?? r.started_at ?? r.created_at,
        result: null,
      } as FlattenedRow;
    }

    if (r.job_type === "CAROUSEL") {
      const res = r.result as DefaultJobResult<CarouselModelResponse> | null;
      const items = res?.content ?? [];
      return items.map(
        (item, idx): FlattenedRow => ({
          id: `${r.id}-${idx}`,
          status: r.status as JobStatus,
          job_type: r.job_type ?? "CAROUSEL",
          created_at: r.created_at,
          updated_at: r.finished_at ?? r.started_at ?? r.created_at,
          result: item,
        })
      );
    }

    if (r.job_type === "VIDEO") {
      const res = r.result as DefaultJobResult<VideoModelResponse> | null;
      const items = res?.content ?? [];
      return items.map(
        (item, idx): FlattenedRow => ({
          id: `${r.id}-${idx}`,
          status: r.status as JobStatus,
          job_type: r.job_type ?? "VIDEO",
          created_at: r.created_at,
          updated_at: r.finished_at ?? r.started_at ?? r.created_at,
          result: item,
        })
      );
    }

    return [];
  });
}

const JobContext = createContext<JobContextType>({
  jobs: null,
  flattenedRows: [] as FlattenedRow[],
  loading: true,
  refreshJobs: async () => {},
});

export const JobProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [flattenedRows, setFlattenedRows] = useState<FlattenedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    if (user) {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching jobs:", error);
        setJobs(null);
      } else {
        setJobs(data);
        setFlattenedRows(flattenJobs(data));
      }
    } else {
      setJobs(null);
    }
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchJobs();
    }
  }, [authLoading, user, fetchJobs]);

  const value = useMemo(
    () => ({
      jobs,
      loading,
      refreshJobs: fetchJobs,
      flattenedRows,
    }),
    [jobs, loading, fetchJobs, flattenedRows]
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
};
