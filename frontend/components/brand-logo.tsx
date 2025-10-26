"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export function BrandLogo({ className }: { className?: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span className={clsx("text-xl font-bold text-foreground", className)}>
        Bulks
      </span>
    );
  }

  return (
    <div className={clsx("flex items-center gap-2 max-h-[28px]", className)}>
      <div className="relative">
        {/* Thumbnail */}
        <Image
          src="/brand/logo-small.png"
          alt="Logo thumbnail"
          width={120}
          height={28}
          className="rounded-lg"
          onError={() => setError(true)}
        />
        {/* Real logo overlay */}
        <Image
          src="/brand/logo.png"
          alt="Logo"
          width={120}
          height={28}
          className="absolute inset-0 rounded-lg"
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}
