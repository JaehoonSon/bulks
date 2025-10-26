import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { PassiveVideoOutput } from "@types";

interface PassiveVideoPlayerProps {
  data: PassiveVideoOutput;
}

export default function PassiveVideoPlayer({ data }: PassiveVideoPlayerProps) {
  return (
    // <Carousel className="relative w-full max-w-xs overflow-hidden rounded-lg">
    //   <CarouselContent className="w-full">
    //     {data.map((output: SlideOutput, i: number) => (
    //       <CarouselItem key={i}>
    //         <div className="p-1 w-full">
    //           <AspectRatio ratio={9 / 16}>
    //             <Image
    //               src={`${process.env.NEXT_PUBLIC_API_URL}${output.path}`}
    //               alt={`Slide ${i + 1}`}
    //               fill
    //               className="object-cover rounded-lg"
    //               sizes="(max-width: 768px) 100vw, 320px"
    //               priority={i === 0}
    //             />
    //           </AspectRatio>
    //         </div>
    //       </CarouselItem>
    //     ))}
    //   </CarouselContent>
    //   {/* keep controls inside the clipped box */}
    //   <CarouselPrevious className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 z-10" />
    //   <CarouselNext className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 z-10" />
    // </Carousel>
    <div className="w-full">
      <AspectRatio ratio={9 / 16}>
        <video
          src={`${process.env.NEXT_PUBLIC_API_URL}${data.path}`}
          controls
          playsInline
          className="object-cover rounded-lg w-full h-full"
        />
      </AspectRatio>
    </div>
  );
}
