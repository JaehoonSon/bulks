import { createClient } from "@/utils/supabase/client";
import type {
  SlideshowRequest,
  SlideshowResponse,
  ApiError,
  JobResponse,
  PassiveVideoReequest,
  PassiveVideoResponse,
} from "./types";

export class PassiveVideoAPI {
  private static baseUrl = "workflow";

  static async generateSlideshow(
    request: PassiveVideoReequest
  ): Promise<JobResponse> {

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("User not authenticated");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${this.baseUrl}/passive-video-from-business`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(request),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: JobResponse = await response.json();

      return data;
    } catch (error) {
      console.log("error")
      console.log(error)
      throw {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate slideshow",
        code: "SLIDESHOW_GENERATION_ERROR",
        status: 500,
      } as ApiError;
    }
  }

  static async uploadBaseVideo(file: File): Promise<{ path: string }> {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/${this.baseUrl}/upload-base-video`,
      {
        method: "POST",
        body: form,
      }
    );
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    return response.json();
  }

  static async pollJob(
    jobId: string,
    signal?: AbortSignal
  ): Promise<JobResponse<PassiveVideoResponse>> {
    const pollUrl = `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`;
    while (true) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const res = await fetch(pollUrl, { signal });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const job: JobResponse<PassiveVideoResponse> = await res.json();

      if (job.status === "finished") return job;
      if (job.status === "failed") {
        throw {
          message: "Job failed",
          code: "SLIDESHOW_JOB_ERROR",
          status: 500,
        } as ApiError;
      }

      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
