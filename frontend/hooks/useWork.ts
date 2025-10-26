import { createClient } from "@/utils/supabase/client";
import { CarouselModelResponse, DefaultJobResult, JobStatus, VideoModelResponse } from "./models";

export const getToken = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("User not authenticated");
    }
    return session.access_token;
}
const base = process.env.NEXT_PUBLIC_API_URL

export interface DefaultPayload {
    businessContext: string;
    contentFormat: string;
    generationAmount: number;
}

export interface DefaultResponse<T = CarouselModelResponse | VideoModelResponse> {
  id: string;
  status: JobStatus;
  result: DefaultJobResult<T>
}

export async function createWork<TPayload, TResponse>(
  route: string,
  payload: TPayload,
  opts?: { signal?: AbortSignal; validate?: (data: unknown) => TResponse }
): Promise<TResponse> {
  const response = await fetch(`${base}${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getToken()}`
    },
    body: JSON.stringify(payload),
    signal: opts?.signal
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  const data: unknown = await response.json();
  return opts?.validate ? opts.validate(data) : (data as TResponse);
}