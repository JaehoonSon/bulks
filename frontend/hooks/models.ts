export type JobStatus =
  | "queued"
  | "started"
  | "deferred"
  | "finished"
  | "failed"
  | "stopped"
  | "scheduled"
  | "canceled";

export interface CarouselObjectType {
  title: string;
  caption: string;
  generation: string[];
}

export interface VideoObjectType {
  title: string;
  caption: string;
  generation: string;
}

export type CarouselModelResponse = CarouselObjectType[];
export type VideoModelResponse = VideoObjectType[];

export interface DefaultJobResult<
  T = CarouselModelResponse | VideoModelResponse
> {
  extra: any;
  content: T;
}
