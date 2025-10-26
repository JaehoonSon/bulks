"use client";
import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { ThreeDMarquee } from "@/components/ui/shadcn-io/3d-marquee";
import ThreeDMarqueeDemo from "@/components/marquee";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh max-h-screen">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="hover:opacity-80">
            <BrandLogo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center mx-auto">
          <div className="w-full max-w-xs mx-auto">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
