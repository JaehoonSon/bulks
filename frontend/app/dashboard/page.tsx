"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Video,
  TrendingUp,
  Clock,
  Plus,
  Play,
  BarChart3,
  Users,
  Zap,
  Wand2,
  MessageSquare,
  Cloud,
} from "lucide-react";
import Link from "next/link";
import { useJob } from "@/contexts/job-context";
import SlidesPlayer from "@/components/player/SlidesPlayer";
import {
  passiveVideoMockData,
  slideShowMockData,
} from "@/components/player/mockData";
import PassiveVideoPlayer from "@/components/player/PassiveVideoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { H1, H3, H4, Muted, P } from "@/components/ui/typography";
import Image from "next/image";
import Gradient from "@/components/ui/gradient";
import { usePublishing } from "@/contexts/publishing-context";
import JobTables from "./library/tables";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DEMO = [
  {
    title: "Create Carousels",
    description:
      "Create stunning slideshows optimized for TikTok and Instagram.",
    image:
      "https://storage.googleapis.com/theblucksshortform/public%20assets/demo/slideshow1.gif",
    href: "/dashboard/carousel",
  },
  {
    title: "Create Videos",
    description: "Transform long text content into engaging video format.",
    image:
      "https://storage.googleapis.com/theblucksshortform/public%20assets/demo/video1.mp4",
    href: "/dashboard/video",
  },
  {
    title: "Appeal to your audience",
    description: "Modern and trendy video styles for your specific audience.",
    image:
      "https://storage.googleapis.com/theblucksshortform/public%20assets/demo/video2.mp4",
    href: "/dashboard/video",
  },
];

export default function DashboardPage() {
  const { jobs, loading: jobLoading } = useJob();
  const { flattenedRows, loading, refreshJobs } = useJob();
  const { data, refetch } = usePublishing();

  // Simple Typewriter component kept local to this page for minimal changes
  const Typewriter = ({
    text,
    speed = 35,
    startDelay = 0,
    className = "",
  }: {
    text: string;
    speed?: number;
    startDelay?: number;
    className?: string;
  }) => {
    const [display, setDisplay] = useState("");
    const [blink, setBlink] = useState(true);

    useEffect(() => {
      let i = 0;
      const start = setTimeout(function tick() {
        const typer = setInterval(() => {
          if (i <= text.length) {
            setDisplay(text.slice(0, i));
            i += 1;
          } else {
            clearInterval(typer);
          }
        }, speed);
        return () => clearInterval(typer);
      }, startDelay);

      const caret = setInterval(() => setBlink((b) => !b), 550);
      return () => {
        clearTimeout(start);
        clearInterval(caret);
      };
    }, [speed, startDelay, text]);

    return (
      <span className={className}>
        {display}
        <span
          className={blink && display != text ? "opacity-100" : "opacity-0"}
        >
          |
        </span>
      </span>
    );
  };

  const formattedRow = flattenedRows.map((row) => {
    const publish_status = data?.find(
      (p) => p.special_reference_id === row.id
    )?.status;
    const scheduled_at = data?.find(
      (p) => p.special_reference_id === row.id
    )?.scheduled_at;
    return {
      ...row,
      publish: {
        status: publish_status ?? null,
        scheduled_at: scheduled_at ?? null,
      },
    };
  });

  const jobLength = jobs?.length ?? 0;
  const carouselCount =
    jobs?.filter((job) => job.job_type === "CAROUSEL").length ?? 0;
  const videoCount =
    jobs?.filter((job) => job.job_type === "PASSIVE_VIDEO").length ?? 0;
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Hero / Get Started */}
      <section className="w-full px-4 pt-8 md:pt-12">
        <div className="max-w-6xl mx-auto grid place-items-center text-center min-h-[42vh] md:min-h-[48vh]">
          <div>
            <Typewriter
              text="get started."
              className="block text-3xl md:text-5xl font-semibold tracking-tight"
              speed={40}
            />
            <Typewriter
              text="what do you want to create today?"
              className="mt-2 block text-base md:text-xl text-muted-foreground"
              speed={22}
              startDelay={900}
            />
          </div>
          <div className="w-full mt-8">
            <motion.div
              className="grid w-full mx-auto max-w-6xl gap-5 grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] justify-items-center items-stretch"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              {DEMO.map((demo, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 14, scale: 0.98 },
                    show: { opacity: 1, y: 0, scale: 1 },
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={demo.href} draggable={false}>
                    <Card className="w-full h-80 border-none py-0 gap-2 bg-card rounded-t-2xl flex flex-col shadow-sm max-w-sm sm:max-w-md">
                      <CardContent className="p-0 rounded-t-2xl flex-1">
                        <div className="w-full aspect-[16/9] shrink-0 rounded-t-2xl">
                          <Gradient
                            index={index}
                            className="w-full h-full rounded-2xl p-2 bg-black"
                          >
                            {demo.image.endsWith(".mp4") ? (
                              <video
                                src={demo.image}
                                width={400}
                                height={300}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="rounded-2xl w-full h-full object-contain"
                              />
                            ) : (
                              <Image
                                src={demo.image}
                                alt={demo.title}
                                width={400}
                                height={300}
                                unoptimized
                                priority
                                draggable={false}
                                className="rounded-2xl w-full h-full object-cover"
                              />
                            )}
                          </Gradient>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-0.5 mb-2 h-20 flex-shrink-0 ">
                        <div className="flex flex-col justify-center h-full">
                          <H3 className="tracking-wider line-clamp-1">
                            {demo.title}
                          </H3>
                          <Muted className="line-clamp-2">
                            {demo.description}
                          </Muted>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 pt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Videos
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs?.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Content Types
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {carouselCount} Carousel
                <br />
                {videoCount} Video
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Potential Views
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(jobLength * 400).toLocaleString() +
                  " - " +
                  (jobLength * 800).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {String((jobs?.length ?? 0) * 2) + "hr"}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
        {flattenedRows.length === 0 && !loading ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Cloud />
              </EmptyMedia>
              <EmptyTitle>No Content Found</EmptyTitle>
              <EmptyDescription>
                You have not generated any content yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="space-x-2">
                <Link href={"/dashboard/video"}>
                  <Button variant="outline" size="sm">
                    <Wand2 />
                    Generate Video
                  </Button>
                </Link>
                <Link href={"/dashboard/video"}>
                  <Button variant="outline" size="sm">
                    <MessageSquare />
                    Generate Video
                  </Button>
                </Link>
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <JobTables flattenedRows={formattedRow} showControls={false} />
        )}
      </div>
    </div>
  );
}
