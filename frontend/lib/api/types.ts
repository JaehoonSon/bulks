export interface JobResponse<T = unknown> {
  id: string;
  status:
    | "queued"
    | "started"
    | "deferred"
    | "finished"
    | "failed"
    | "stopped"
    | "scheduled"
    | "canceled";
  result?: T;
}

export type SlideOutput = { index: number; path: string };

export interface SlideData {
  count: number;
  outputs: SlideOutput[];
}

export interface SlideshowResponse {
  outputs: SlideData[];
}

export interface SlideshowRequest {
  topic: string;
  businessContext?: string | null;
  numberOfSlides: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export type PassiveVideoOutput = {index:number, caption: string, path: string, file_size_mb: number}

export interface PassiveVideoResponse {
  business_context: string;
  captions: string[];
  videos: PassiveVideoOutput[]
  count: number;
}

export interface PassiveVideoReequest {
  topic: string;
  businessContext?: string | null;
  numberOfVideos: number;
}
