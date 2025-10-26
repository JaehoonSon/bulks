"use client";
import CarouselPlayer from "@/components/player/CarouselPlayer";
import VideoPlayer from "@/components/player/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H2, Large, Muted, P } from "@/components/ui/typography";
import { useBusinessContext } from "@/contexts/business-context";
import {
  CarouselModelResponse,
  VideoModelResponse,
  CarouselObjectType,
  VideoObjectType,
} from "@/hooks/models";
import { useJob } from "@/hooks/useJob";
import { createWork, DefaultPayload, DefaultResponse } from "@/hooks/useWork";
import { CameraIcon, CircleAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CAROUSEL_CONTENT_STYLE = [
  { id: "personal-story", title: "Personal Story" },
  { id: "personal-progress", title: "Personal Progress" },
];
const VIDEO_CONTENT_STYLE = [
  {
    id: "personal-story",
    title: "Personal Story",
  },
];

interface EditorProps {
  mode?: "video" | "carousel";
}

export default function Editor({ mode: modeProp }: EditorProps) {
  const pathname = usePathname();
  const inferredMode: "video" | "carousel" = pathname?.includes("/carousel")
    ? "carousel"
    : "video";
  const mode = modeProp ?? inferredMode;
  type Mode = "video" | "carousel";
  type ResultByMode<M extends Mode> = M extends "video"
    ? VideoModelResponse
    : CarouselModelResponse;
  type ItemByMode<M extends Mode> = M extends "video"
    ? VideoObjectType
    : CarouselObjectType;
  const MODE_CONFIG = {
    video: {
      endpoint: "/workflow/video",
      title: "Generate Video",
      emptyTitle: "Generate Your First Video",
      emptyDescription:
        "Use the form to the left to generate your first video.",
      styles: VIDEO_CONTENT_STYLE,
      renderItem: (item: VideoObjectType, index: number) => (
        <VideoPlayer key={index} data={item} />
      ),
    },
    carousel: {
      endpoint: "/workflow/carousel",
      title: "Generate Carousel",
      emptyTitle: "Generate Your First Carousel",
      emptyDescription:
        "Use the form to the left to generate your first carousel.",
      styles: CAROUSEL_CONTENT_STYLE,
      renderItem: (item: CarouselObjectType, index: number) => (
        <CarouselPlayer key={index} data={item} />
      ),
    },
  } as const;
  const cfg = MODE_CONFIG[mode];
  const { formattedContext, contexts, selectedContext, selectContext } =
    useBusinessContext();
  const [contentFormat, setcontentFormat] = useState<string | null>(null);
  const [generationAmount, setGenerationAmount] = useState<string>("1");
  // Use a union for shared hook while switching UI/endpoint by mode
  type CurrentResult = ResultByMode<typeof mode>;
  type CurrentItem = ItemByMode<typeof mode>;
  const { data, loading, refetch, error } = useJob<CurrentResult>();
  // useEffect(() => {
  //   toast("hello");
  // }, []);

  const handleSubmit = async () => {
    console.log({ formattedContext, contentFormat, generationAmount });

    if (
      formattedContext.length === 0 ||
      contentFormat === null ||
      isNaN(Number(generationAmount)) ||
      generationAmount == ""
    ) {
      toast.error("Please fill in all fields", {
        description: "All fields are required",
        action: { label: "Close", onClick: () => toast.dismiss() },
      });
      return;
    }

    const endpoint = cfg.endpoint;
    const jobCreated: DefaultResponse<CurrentResult> = await createWork<
      DefaultPayload,
      DefaultResponse<CurrentResult>
    >(endpoint, {
      businessContext: formattedContext,
      contentFormat,
      generationAmount: Number(generationAmount),
    });
    jobCreated.id && refetch(jobCreated.id);
  };

  return (
    <div>
      {error && (
        <div className="px-4">
          <P className="text-destructive">{error}</P>
        </div>
      )}
      <div className="flex flex-col md:flex-row w-full min-h-screen max-w-full">
        <div className="md:flex-shrink-0 md:w-md min-h-[50vh] md:min-h-screen p-4 border-r bg-background">
          <Card className="w-full shadow-none ring-0 border-0">
            <CardHeader>
              <H2 className="border-b-0">{cfg.title}</H2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Large className="border-b-2">Business Context</Large>
                <div className="flex flex-wrap gap-2">
                  {contexts.map((item, index) => (
                    <Button
                      key={index}
                      className="rounded-full"
                      variant={
                        selectedContext?.name == item.name
                          ? "default"
                          : "outline"
                      }
                      onClick={() => selectContext(item.id)}
                    >
                      {item.name}
                    </Button>
                  ))}
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        className={`rounded-full ${
                          contexts.length === 0
                            ? "font-semibold text-yellow-300"
                            : ""
                        }`}
                        variant={
                          contexts.length == 0 ? "destructive" : "outline"
                        }
                        onClick={() => {
                          window.dispatchEvent(
                            new Event("open-business-context-create")
                          );
                        }}
                      >
                        {contexts.length === 0 && (
                          <CircleAlert color="yellow" strokeWidth={3} />
                        )}
                        Add New Context
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add new Context</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="space-y-2">
                <Large className="border-b-2">Content Style</Large>
                <div className="flex flex-wrap gap-2">
                  {cfg.styles.map((style, index) => (
                    <Button
                      key={index}
                      className="rounded-full"
                      variant={
                        contentFormat === style.id ? "default" : "secondary"
                      }
                      onClick={() => setcontentFormat(style.id)}
                    >
                      {style.title}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Large className="border-b-2">Generation Amount</Large>
                <Input
                  placeholder="Enter amount"
                  value={generationAmount ?? ""}
                  type="text"
                  onChange={(e) => setGenerationAmount(e.target.value)}
                ></Input>
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading && <Spinner />}
                <Large>Generate</Large>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-h-[50vh] md:min-h-screen p-4 bg-background overflow-x-hidden">
          <Card className="w-full max-w-full h-full shadow-none ring-0 border-0">
            <CardHeader>
              <H2 className="border-b-0">Preview</H2>
            </CardHeader>
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data &&
                  data.status == "finished" &&
                  data.result?.content &&
                  (data.result.content as CurrentResult).map((e, index) =>
                    // render function is typed per-mode; e is correctly typed element of CurrentResult
                    // @ts-expect-error TS cannot fully narrow based on runtime mode inference
                    cfg.renderItem(e as unknown as CurrentItem, index)
                  )}
              </div>
              {loading && (
                <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12">
                  <Spinner className="size-20" />
                  <Muted className="text-xl">Loading...</Muted>
                </div>
              )}
              {data === null && (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <CameraIcon />
                    </EmptyMedia>
                    <EmptyTitle>{cfg.emptyTitle}</EmptyTitle>
                    <EmptyDescription>{cfg.emptyDescription}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
