import {
  PassiveVideoOutput,
  SlideOutput,
  SlideshowResponse,
} from "@/lib/api/types";

export const slideShowMockData: SlideOutput[] = [
  { path: "/outputs/751eb2ee-351e-4cc6-b871-9640b26011de/1/01.png", index: 1 },
  { path: "/outputs/751eb2ee-351e-4cc6-b871-9640b26011de/1/02.png", index: 2 },
  { path: "/outputs/751eb2ee-351e-4cc6-b871-9640b26011de/1/03.png", index: 3 },
  { path: "/outputs/751eb2ee-351e-4cc6-b871-9640b26011de/1/04.png", index: 4 },
  { path: "/outputs/751eb2ee-351e-4cc6-b871-9640b26011de/1/05.png", index: 5 },
  { path: "/outputs/751eb2ee-351e-4cc6-b871-9640b26011de/1/06.png", index: 6 },
  { path: "/outputs/751eb2ee-351e-4cc6-b871-9640b26011de/1/07.png", index: 7 },
];

export const passiveVideoMockData: PassiveVideoOutput = {
  path: "/outputs/f38a71ac-26b6-47df-babf-90745f9aa16c/1/video_01.mp4",
  index: 1,
  caption: "Caption for video 1",
  file_size_mb: 15.2,
};
