import { getToken } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { DefaultResponse } from "./useWork";

const TERMINAL = new Set(["finished", "failed", "stopped", "canceled"] as const);

export function useJob<T>(initialJobId?: string, intervalMs = 1000) {
  const [data, setData] = useState<DefaultResponse<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | undefined>(initialJobId);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef<boolean>(true); // controls polling

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    timerRef.current = null;
    abortRef.current = null;
  };

  const stop = () => {
    stoppedRef.current = true;
    clearTimers();
    setLoading(false);
  };

  const pollOnce = async (base: string, id: string) => {
    if (stoppedRef.current) return;
    abortRef.current = new AbortController();
    fetch(`${base}/jobs/${id}`, {
      method: "GET",
      cache: "no-store",
      signal: abortRef.current.signal,
      headers: { Authorization: `Bearer ${await getToken()}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as DefaultResponse<T>;
      })
      .then((payload) => {
        if (stoppedRef.current) return;
        setData(prev => payload);
        if (payload.status == "failed"){
          setError("Job failed");
        }
        if (TERMINAL.has(payload.status as any)) {
          stop(); // stop on finished/failed/etc
          return;
        }
        timerRef.current = setTimeout(() => pollOnce(base, id), intervalMs);
      })
      .catch((e: any) => {
        if (stoppedRef.current || e?.name === "AbortError") return;
        setError(e?.message ?? "request failed");
        stop();
      });
  };

  // manual start; optional id overrides current jobId
  const refetch = (overrideId?: string) => {
    const targetId = overrideId ?? jobId;
    if (!targetId) return;
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      setError("NEXT_PUBLIC_API_URL is not set");
      return;
    }
    clearTimers();
    stoppedRef.current = false;
    setError(null);
    setLoading(true);
    if (overrideId && overrideId !== jobId) setJobId(overrideId);
    pollOnce(base, targetId);
  };

  // only clean up on unmount or interval change; no auto-start on id change
  useEffect(() => () => stop(), [intervalMs]);

  return { data, loading, error, refetch, stop, setJobId, jobId };
}
