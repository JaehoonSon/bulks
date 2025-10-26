import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { SlideOutput } from "@types";
import { useEffect, useState } from "react";

interface SlidesPlayerProps {
  data: SlideOutput[];
}

export default function SlidesPlayer({ data }: SlidesPlayerProps) {
  return (
    <Carousel className="relative w-full overflow-hidden rounded-lg">
      <CarouselContent className="w-full">
        {data.map((output: SlideOutput, i: number) => (
          <CarouselItem key={i}>
            <div className="p-1 w-full">
              <AspectRatio ratio={9 / 16}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${output.path}`}
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
      {/* keep controls inside the clipped box */}
      <CarouselPrevious className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 z-10" />
      <CarouselNext className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 z-10" />
    </Carousel>
  );
}

// export default function SlidesPlayer({ data }: SlidesPlayerProps) {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     if (data.length <= 1) return;
//     const id = setInterval(() => {
//       setCurrent((i) => (i + 1) % data.length);
//     }, 2000);
//     return () => clearInterval(id);
//   }, [data.length]);

//   const goNext = () => setCurrent((i) => (i + 1) % data.length);
//   const goPrev = () => setCurrent((i) => (i - 1 + data.length) % data.length);

//   return (
//     <div className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg bg-muted">
//       <img
//         src={`${process.env.NEXT_PUBLIC_API_URL}${data[current].path}`}
//         alt="slideshow"
//         className="absolute inset-0 h-full w-full object-cover"
//       />
//       <div className="absolute top-2 left-2">
//         <span className="px-2 py-1 text-[10px] rounded bg-black/60 text-white">
//           Slide Show
//         </span>
//       </div>

//       {data.length > 1 && (
//         <>
//           <button
//             aria-label="Previous slide"
//             onClick={(e) => {
//               e.stopPropagation();
//               goPrev();
//             }}
//             className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center backdrop-blur-sm hover:bg-black/60 transition"
//           >
//             ‹
//           </button>
//           <button
//             aria-label="Next slide"
//             onClick={(e) => {
//               e.stopPropagation();
//               goNext();
//             }}
//             className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center backdrop-blur-sm hover:bg-black/60 transition"
//           >
//             ›
//           </button>
//         </>
//       )}

//       {data.length > 1 && (
//         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
//           {data.map((_, i) => (
//             <button
//               key={i}
//               aria-label={`Go to slide ${i + 1}`}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setCurrent(i);
//               }}
//               className={`h-1.5 w-1.5 rounded-full ${
//                 i === current ? "bg-white" : "bg-white/50"
//               }`}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
