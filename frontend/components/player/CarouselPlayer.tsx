"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import type { CarouselApi } from "../ui/carousel";
import { CarouselModelResponse, CarouselObjectType } from "@/hooks/models";

interface CarouselPlayerProps {
  data: CarouselObjectType;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
}

export default function CarouselPlayer({
  data,
  autoPlay = false,
  autoPlayInterval = 2000,
  showControls = true,
}: CarouselPlayerProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!api || !autoPlay) return;

    const startAutoPlay = () => {
      if (isHovered) return;

      const interval =
        currentIndex === 0 ? autoPlayInterval / 2 : autoPlayInterval;

      intervalRef.current = setInterval(() => {
        api.scrollNext();
      }, interval);
    };

    const stopAutoPlay = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startAutoPlay();

    return () => stopAutoPlay();
  }, [api, autoPlay, autoPlayInterval, isHovered, currentIndex]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Carousel
        className="relative w-full overflow-hidden rounded-lg mx-auto"
        setApi={setApi}
      >
        <CarouselContent className="w-full mx-auto">
          {data.generation.map((output: string, i: number) => (
            <CarouselItem key={i}>
              <div className="p-1 w-full mx-auto">
                <AspectRatio ratio={9 / 16}>
                  <Image
                    src={new URL(
                      output,
                      process.env.NEXT_PUBLIC_API_URL
                    ).toString()}
                    alt={`Slide ${i + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority={i === 0}
                  />
                </AspectRatio>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 z-10" />
          </>
        )}
      </Carousel>
    </div>
  );
}
