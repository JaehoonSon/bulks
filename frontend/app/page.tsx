"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  Zap,
  BarChart3,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { motion } from "framer-motion";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/ui/shadcn-io/marquee";
import { P } from "@/components/ui/typography";

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedFormatExample, setSelectedFormatExample] = useState<
    | "all"
    | "ugc-ad"
    | "speaking-character"
    | "wall-text"
    | "fast-cut"
    | "slideshow"
    | null
  >("all");

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ugcAdVideos: string[] = [
    "https://storage.googleapis.com/theblucksshortform/public%20assets/marquee/video_01.mp4",
    "https://framerusercontent.com/assets/jiNp4AteEIS5Lmy7FUmtdXzSp4.mp4",
    "https://framerusercontent.com/assets/IbjKA6C5kcdi445P1PZISedZo.mp4",
    "https://framerusercontent.com/assets/se95soUI6bfwWqDxadkpFHZSz0.mp4",
    "https://framerusercontent.com/assets/PzcNIuKuuKnRyRUgPfF26YwVkA.mp4",
    "https://framerusercontent.com/assets/LFA3nE8AAuNS6SgHBQnrON8rUY.mp4",
  ];

  const speakingCharacterVideos: string[] = [
    "https://storage.googleapis.com/theblucksshortform/public%20assets/marquee/video_02.mp4",
    "https://framerusercontent.com/assets/85uGd7GIov9OHvTDZeimtliJAN8.mp4",
    "https://framerusercontent.com/assets/QLskEqd5mL60NzHLJigICAgJ0VY.mp4",
    "https://framerusercontent.com/assets/jaKMSWhoBvsAHi6LjxUxMZhqVw.mp4",
    "https://framerusercontent.com/assets/s59VSPO9N0A5HOMwdnvB85Uq1c.mp4",
    "https://framerusercontent.com/assets/f7yzmvW8aCRDw6fBkFk92AJyIg.mp4",
    "https://framerusercontent.com/assets/zfqpPBtamMMJ48ibW4vEuXW5sw.mp4",
    "https://framerusercontent.com/assets/HKVus3QETCBHHbf0tUoJZ6UaTc.mp4",
  ];

  const wallTextVideos: string[] = [
    "https://framerusercontent.com/assets/PSmFbXk27F8mIhDIGUBEsy5Lg.mp4",
    "https://framerusercontent.com/assets/MtVbDdRbOMwMZxJazVzEMqnLRH4.mp4",
    "https://framerusercontent.com/assets/i1jAX3bqzHIGJAcU6z9OdO5I9Zc.mp4",
    "https://framerusercontent.com/assets/V7afxN0zXb5b8iSEWArQHkAcN4E.mp4",
    "https://framerusercontent.com/assets/mq108EjA4mkoto11mJZTBpoXJ40.mp4",
  ];

  const fastCutVideos: string[] = [
    "https://framerusercontent.com/assets/ew8lfwzxhhTtDTxwmcoV1VT1RwA.mp4",
    "https://framerusercontent.com/assets/BFqbtRr5DPfSqY3iSOMnZpLoi8.mp4",
    "https://framerusercontent.com/assets/tNFqb90nt1TXq5AD5SpdmPxoPY.mp4",
    "https://framerusercontent.com/assets/mAG0jx9Yxw1Rm0tyrtUmPROrYXw.mp4",
    "https://framerusercontent.com/assets/DpLyzXchraleUEuhSDJBHJ9aZVI.mp4",
  ];

  const slideshowSets: string[][] = [
    [
      "https://framerusercontent.com/images/eEaAUFdbbdT6ceKm5dvSy00qqc.jpeg",
      "https://framerusercontent.com/images/VPBg9lhKmQWwZDtDvXRkWkwABc.jpeg",
      "https://framerusercontent.com/images/LPBOiT0vgTNSdtcg049KbDKPHBU.jpeg",
      "https://framerusercontent.com/images/x3i6Ad46cHeywv6PEJ0KOKcUbTo.jpeg",
      "https://framerusercontent.com/images/GCw0AQ2zlmcVXDT87HQnmVIo1ms.jpeg",
    ],
    [
      "https://framerusercontent.com/images/ImOJqwDFtTE7cEq6Wh8ynFSzns.jpeg",
      "https://framerusercontent.com/images/t1EDCzMypDP551SRwSD9sV2bA1w.jpeg",
      "https://framerusercontent.com/images/erFncPat7rcn3U5HB93DnsLzUw.jpeg",
      "https://framerusercontent.com/images/96eplxDoMm37WPjZr9WXsMUYPw.jpeg",
      "https://framerusercontent.com/images/beJtMFVVHeqmIC6Bdrw3vc99MI.jpeg",
      "https://framerusercontent.com/images/rb81iyPSA0r5J9zKx8EWWTY9L0.jpeg",
    ],
    [
      "https://framerusercontent.com/images/wq0ywDrARc2XhRJ4seygjtxzJs.jpeg",
      "https://framerusercontent.com/images/6ugdQSwEfKWIxGYqMxNzoTPYaU4.jpeg",
      "https://framerusercontent.com/images/eF3i9RL9mjvAB7M4KA4ztp1888.jpeg",
      "https://framerusercontent.com/images/208SECr1fkpnGRPN4P97CIfgTEY.jpeg",
      "https://framerusercontent.com/images/LOnuBhLeGl8fl4ZHyZJbKmBEA.jpeg",
    ],
    [
      "https://framerusercontent.com/images/t43dY2uuuq0rlh4i4tcLKlS9gsw.jpeg",
      "https://framerusercontent.com/images/F8sodnqgbNLNgzSIW4ynaLGsNI.jpeg",
      "https://framerusercontent.com/images/8lkXeXsLnFxP5J1EJbySEqnm34.jpeg",
      "https://framerusercontent.com/images/S8VnSoNSiCxomZehZ8d86zspXc.jpeg",
    ],
    [
      "https://framerusercontent.com/images/28vNx6sK05gAWng9GA3nVRvnUQ.jpeg",
      "https://framerusercontent.com/images/FYtEoyImfesdljAQwNXa7KUhciQ.jpeg",
      "https://framerusercontent.com/images/F53ZqMrRevpgmhaDHXnVNo1dvE.jpeg",
      "https://framerusercontent.com/images/GI1Kn9sPsTXc1m8LDj83pjyG00.jpeg",
      "https://framerusercontent.com/images/y4AaA2j0uABFJ24BJCZsveDsI.jpeg",
    ],
  ];

  // Determine current grid columns to cap to two rows responsively
  const [gridCols, setGridCols] = useState(2);
  useEffect(() => {
    const update = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 0;
      if (width >= 1024) setGridCols(5);
      else if (width >= 768) setGridCols(4);
      else if (width >= 640) setGridCols(3);
      else setGridCols(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const maxItems = gridCols * 2;

  type MediaItem =
    | { kind: "video"; src: string }
    | { kind: "slideshow"; images: string[] };
  const allMediaItems: MediaItem[] = [
    // ...ugcAdVideos.map((src) => ({ kind: "video", src } as const)),
    // ...speakingCharacterVideos.map((src) => ({ kind: "video", src } as const)),
    ...wallTextVideos.map((src) => ({ kind: "video", src } as const)),
    // ...fastCutVideos.map((src) => ({ kind: "video", src } as const)),
    ...slideshowSets.map((images) => ({ kind: "slideshow", images } as const)),
  ].sort((e) => Math.random());

  // Add custom animations
  const customStyles = `
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }
    .animate-blink {
      animation: blink 2s infinite;
    }
  `;

  // Framer Motion variants for scroll animations
  const scrollVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const staggerChild = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Hero variants (existing)
  const heroContainer = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
    },
  } as const;
  const heroItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  } as const;

  const SlideshowCard = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
      if (images.length <= 1) return;
      const id = setInterval(() => {
        setCurrent((i) => (i + 1) % images.length);
      }, 2000);
      return () => clearInterval(id);
    }, [images.length]);

    const goNext = () => setCurrent((i) => (i + 1) % images.length);
    const goPrev = () =>
      setCurrent((i) => (i - 1 + images.length) % images.length);

    return (
      <div className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg bg-muted">
        <Image
          src={images[current]}
          alt="slideshow"
          fill
          className="object-cover"
          sizes="(min-width:1024px) 20vw, (min-width:768px) 25vw, (min-width:640px) 33vw, 50vw"
          priority={false}
        />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-[10px] rounded bg-black/60">
            Slide Show
          </span>
        </div>

        {images.length > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center backdrop-blur-sm hover:bg-black/60 transition"
            >
              ‹
            </button>
            <button
              aria-label="Next slide"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center backdrop-blur-sm hover:bg-black/60 transition"
            >
              ›
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === current ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen bg-background">
        {/* Header (floating) */}
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-x-0 top-4 z-50 transition-all duration-300"
        >
          <div
            className={`transition-all duration-300 ${
              isScrolled ? "container mx-auto px-4 sm:px-6" : "px-8 sm:px-12"
            }`}
          >
            <div
              className={`relative mx-auto rounded-full transition-all duration-300 ${
                isScrolled
                  ? "landing-header max-w-3xl px-4 sm:px-6 py-1.5"
                  : "max-w-7xl px-6 sm:px-8 py-3"
              }`}
            >
              <div className="flex items-center justify-between gap-4 w-full">
                {/* Brand */}
                <BrandLogo />

                {/* Center Navigation - Always visible */}
                <nav
                  className={`hidden md:flex items-center transition-all duration-300 ${
                    isScrolled ? "gap-4" : "gap-6"
                  }`}
                >
                  <Link
                    href="#features"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/founders"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    asChild
                    className={`transition-all duration-300 ${
                      isScrolled ? "px-4 py-2" : "px-6 py-2.5"
                    }`}
                  >
                    <Link href="/dashboard">Login</Link>
                  </Button>

                  <Button
                    asChild
                    className={`transition-all duration-300 ${
                      isScrolled
                        ? "landing-pill px-4 py-2"
                        : "px-6 py-2.5 rounded-full"
                    }`}
                  >
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="relative min-h-[100svh] pt-40 sm:pt-40 md:pt-44 lg:pt-48 pb-24 px-6 overflow-hidden">
          <motion.div
            className="container mx-auto text-center relative z-10"
            variants={heroContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={heroItem}>
              <Badge variant="secondary" className="mb-6 text-sm font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Viral Content Automation Platform
              </Badge>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-6 text-balance leading-tight."
            >
              Automate your tiktok content creation with AI
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto text-pretty leading-relaxed"
            >
              Transform your content strategy with our platform that
              auto-generates engaging tiktok and reels — perfect for marketers
              and creators.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button
                size="lg"
                className="text-lg px-6 py-6 shadow-xl rounded-2xl"
                asChild
              >
                <Link href="/dashboard">Start Creating</Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-6 py-6 rounded-2xl border-1"
                asChild
              >
                <Link href="#pricing" className="flex items-center gap-2">
                  See Our Plans
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={heroItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                {/* <div className="flex -space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background animate-float"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div> */}
                <span className="text-center sm:text-left">
                  Generated 20M+ Views
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-1">4.9/5 user rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Infinite Marquee of video examples - Full Width */}
          <div className="mt-14 w-full">
            <Marquee className="py-8">
              <MarqueeFade side="left" />
              <MarqueeFade side="right" />
              <MarqueeContent speed={40}>
                {[
                  ...ugcAdVideos,
                  ...speakingCharacterVideos,
                  ...wallTextVideos,
                  ...fastCutVideos,
                  ...slideshowSets.map((set) => set[0]),
                ].map((src, index) => (
                  <MarqueeItem key={index}>
                    <div className="relative w-[220px] aspect-[9/19.5] rounded-[2.5rem] border border-white/10 bg-black/90 shadow-2xl overflow-hidden ring-1 ring-black/20">
                      {src.endsWith(".mp4") ? (
                        <video
                          src={src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={src}
                          alt={`Example ${index}`}
                          fill
                          className="object-cover"
                          sizes="220px"
                          // priority
                          fetchPriority="high"
                        />
                      )}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 rounded-b-2xl bg-black/70"></div>
                    </div>
                  </MarqueeItem>
                ))}
              </MarqueeContent>
            </Marquee>
          </div>
        </section>

        {/* Features Introduction */}
        {/* <motion.section
          id="features"
          className="relative py-20 px-6 bg-muted/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollVariants}
        >
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-[hsl(var(--muted)/0.30)] to-transparent"></div>
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-16"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={staggerChild}>
                <Badge variant="outline" className="mb-4">
                  Core Features
                </Badge>
              </motion.div>
              <motion.h2
                variants={staggerChild}
                className="text-4xl font-bold text-foreground mb-4"
              >
                Everything You Need to Scale Content Creation
              </motion.h2>
              <motion.p
                variants={staggerChild}
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                From creative ideation to publish analytics, we provide a
                complete short-form video creation solution
              </motion.p>
            </motion.div>
          </div>
        </motion.section> */}

        {/* Video Formats Section */}
        <motion.section
          className="relative py-24 px-6 bg-muted/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollVariants}
        >
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={staggerChild}>
                <Badge variant="outline" className="mb-4">
                  Core Feature
                </Badge>
              </motion.div>
              <motion.h3
                variants={staggerChild}
                className="text-4xl font-bold text-foreground mb-4"
              >
                Video Formats
              </motion.h3>
              <motion.p
                variants={staggerChild}
                className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              >
                Create diverse video formats optimized for different platforms
                and audiences, from UGC-style content to professional speaking
                characters.
              </motion.p>
            </motion.div>

            {/* Format Filter Buttons */}
            <motion.div
              variants={staggerChild}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              <Button
                variant={
                  selectedFormatExample === "all" ? "default" : "outline"
                }
                size="lg"
                className="px-6 py-3 text-base font-medium rounded-2xl"
                onClick={() => setSelectedFormatExample("all")}
              >
                See all
              </Button>
              <Button
                variant={
                  selectedFormatExample === "wall-text" ? "default" : "outline"
                }
                size="lg"
                className="px-6 py-3 text-base font-medium rounded-2xl"
                onClick={() => setSelectedFormatExample("wall-text")}
              >
                Wall of Text
              </Button>
              <Button
                variant={
                  selectedFormatExample === "slideshow" ? "default" : "outline"
                }
                size="lg"
                className="px-6 py-3 text-base font-medium rounded-2xl"
                onClick={() => setSelectedFormatExample("slideshow")}
              >
                Slideshow
              </Button>
            </motion.div>

            {/* Video Examples Display */}
            {selectedFormatExample && (
              <motion.div
                className="w-full max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {selectedFormatExample === "all" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {allMediaItems.slice(0, maxItems).map((item, idx) =>
                      item.kind === "video" ? (
                        <div
                          key={idx}
                          className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg bg-black"
                        >
                          <video
                            src={item.src}
                            className="absolute inset-0 h-full w-full object-cover"
                            playsInline
                            autoPlay
                            muted
                            loop
                          />
                        </div>
                      ) : (
                        <SlideshowCard key={idx} images={item.images} />
                      )
                    )}
                  </div>
                )}

                {selectedFormatExample === "wall-text" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {wallTextVideos.map((src, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg bg-black"
                      >
                        <video
                          src={src}
                          className="absolute inset-0 h-full w-full object-cover"
                          playsInline
                          autoPlay
                          muted
                          loop
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedFormatExample === "slideshow" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {slideshowSets.slice(0, maxItems).map((images, idx) => (
                      <SlideshowCard key={idx} images={images} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Bulk Generation Section - Image Left, Description Right */}
        <motion.section
          className="relative py-24 px-6 bg-background"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollVariants}
        >
          <div className="container mx-auto max-w-7xl">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden transition-all duration-300">
              <div
                className="grid md:grid-cols-2 lg:grid-cols-[3fr_2fr] gap-0"
                style={{
                  minHeight: "min(650px, 70vh)",
                  height: "min(780px, 70vh)",
                }}
              >
                {/* Image/Visual Section - LEFT */}
                <motion.div
                  variants={staggerChild}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-6 flex items-center justify-center"
                >
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/10 to-muted/50 border border-primary/20 flex items-center justify-center shadow-lg p-6">
                    <div className="grid grid-cols-5 gap-2 w-full h-full max-h-[600px]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <div
                          key={i}
                          className="aspect-[9/16] rounded-md bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center"
                        >
                          <Play className="h-4 w-4 text-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Description Section - RIGHT */}
                <motion.div
                  variants={staggerChild}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="p-8 lg:p-16 flex flex-col justify-center"
                >
                  <div className="max-w-prose space-y-6">
                    <p className="text-base md:text-2xl text-muted-foreground leading-snug">
                      <span className="text-foreground font-medium">
                        Use AI-powered automation
                      </span>{" "}
                      to generate multiple video variants at once, dramatically
                      boosting your creative efficiency and content output.
                    </p>
                    <div>
                      <Button
                        className="group bg-primary hover:bg-primary/90 text-primary-foreground"
                        asChild
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2"
                        >
                          Learn More
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Performance Analytics Section - Description Left, Image Right */}
        <motion.section
          className="relative py-6 px-6 bg-background"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollVariants}
        >
          <div className="container mx-auto max-w-7xl">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden transition-all duration-300">
              <div
                className="grid md:grid-cols-2 lg:grid-cols-[2fr_3fr] gap-0"
                style={{
                  minHeight: "min(650px, 70vh)",
                  height: "min(780px, 70vh)",
                }}
              >
                {/* Description Section - LEFT */}
                <motion.div
                  variants={staggerChild}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="p-8 lg:p-16 flex flex-col justify-center order-2 md:order-1"
                >
                  <div className="max-w-prose space-y-6">
                    <p className="text-base md:text-2xl text-muted-foreground leading-snug">
                      <span className="text-foreground font-medium">
                        Track your content performance,
                      </span>{" "}
                      gain deep insights, and optimize strategies for better
                      user engagement and viral potential.
                    </p>
                    <div>
                      <Button
                        className="group bg-primary hover:bg-primary/90 text-primary-foreground"
                        asChild
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2"
                        >
                          Learn More
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Image/Visual Section - RIGHT */}
                <motion.div
                  variants={staggerChild}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-6 flex items-center justify-center order-1 md:order-2"
                >
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/10 to-muted/50 border border-primary/20 flex items-center justify-center shadow-lg p-8">
                    <div className="w-full h-full flex flex-col justify-center space-y-8 max-h-[600px]">
                      {/* Bar Chart */}
                      <div className="flex justify-center items-end gap-3 h-48 flex-1">
                        {[40, 60, 30, 80, 50, 70, 90, 45, 65, 75, 55, 85].map(
                          (height, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-primary/60 to-primary/30 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                          )
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center border border-primary/20">
                          <div className="text-xl font-bold text-primary">
                            2.4M
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Views
                          </div>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center border border-primary/20">
                          <div className="text-xl font-bold text-primary">
                            89%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Engagement
                          </div>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center border border-primary/20">
                          <div className="text-xl font-bold text-primary">
                            8.7
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Score
                          </div>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center border border-primary/20">
                          <div className="text-xl font-bold text-green-500">
                            +24%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Growth
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollVariants}
        >
          <motion.div
            className="container mx-auto text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={staggerChild}
              className="text-4xl font-bold text-foreground mb-6"
            >
              Ready to Start Creating?
            </motion.h2>

            <motion.p
              variants={staggerChild}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join thousands of content creators and start using our AI-powered
              video generation platform
            </motion.p>
            <motion.div
              variants={staggerChild}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="text-lg px-6 py-3 shadow-xl rounded-full"
                asChild
              >
                <Link href="/dashboard">Start Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-6 py-3 rounded-full"
                asChild
              >
                <Link href="/founders">Contact Founders</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="border-t border-border bg-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollVariants}
        >
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <BrandLogo />
              <div className="flex flex-col items-center gap-2 sm:items-end">
                <p className="text-sm text-muted-foreground text-center sm:text-right">
                  © 2025 Bulks. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
}
