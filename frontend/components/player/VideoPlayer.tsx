import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import {
  CarouselModelResponse,
  CarouselObjectType,
  VideoObjectType,
} from "@/hooks/models";

interface CarouselPlayerProps {
  data: VideoObjectType;
}

export default function VideoPlayer({ data }: CarouselPlayerProps) {
  return (
    <Carousel className="relative w-full overflow-hidden rounded-lg">
      <CarouselContent className="w-full">
        <CarouselItem>
          <div className="p-1 w-full">
            <AspectRatio ratio={9 / 16}>
              <video
                src={new URL(
                  data.generation,
                  process.env.NEXT_PUBLIC_API_URL
                ).toString()}
                className="object-cover rounded-lg"
                controls
                playsInline
              />
            </AspectRatio>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}
