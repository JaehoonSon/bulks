"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ConfettiBurstProps = {
  durationMs?: number;
  particleCount?: number;
};

// Lightweight canvas confetti without external deps.
export function ConfettiBurst({
  durationMs = 2200,
  particleCount = 160,
}: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      // reset and rescale to map CSS px to device px
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "#FFC700",
      "#FF3D00",
      "#2E7DFA",
      "#00C853",
      "#FF80AB",
      "#7C4DFF",
    ];
    const gravity = 0.12;
    const drag = 0.005;
    const friction = 0.985;
    const spread = Math.PI / 2; // 90deg
    const centerX = window.innerWidth / 2;
    const startY = window.innerHeight * 0.15;
    const startTime = performance.now();

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      color: string;
      alpha: number;
      shape: "rect" | "circle";
    };

    const rand = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const particles: Particle[] = Array.from({ length: particleCount }).map(
      () => {
        const angle = -Math.PI / 2 + rand(-spread / 2, spread / 2);
        const speed = rand(4, 10);
        return {
          x: centerX + rand(-40, 40),
          y: startY + rand(-20, 20),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: rand(3, 7),
          rotation: rand(0, Math.PI * 2),
          rotationSpeed: rand(-0.2, 0.2),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          shape: Math.random() > 0.5 ? "rect" : "circle",
        };
      }
    );

    const draw = (now: number) => {
      const t = now - startTime;
      if (!ctx) return;
      // clear using CSS pixel units (context is scaled)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      // draw using CSS pixels (we scaled the context already)
      particles.forEach((p) => {
        // physics
        p.vy += gravity;
        // air drag
        p.vx *= 1 - drag;
        p.vy *= 1 - drag;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        // fade out near the end
        const fadeStart = durationMs * 0.65;
        if (t > fadeStart) {
          const remaining = Math.max(0, durationMs - t);
          p.alpha = Math.max(0, remaining / (durationMs - fadeStart));
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (t < durationMs) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [durationMs, particleCount]);

  // Render at the document body level to avoid being clipped by stacking contexts
  return createPortal(
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden
    />,
    typeof document !== "undefined" ? document.body : ({} as any)
  );
}

export default ConfettiBurst;
