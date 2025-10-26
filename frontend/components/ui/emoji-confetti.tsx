"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

type EmojiConfettiProps = {
  count?: number;
  durationMs?: number;
  emojis?: string[];
};

export default function EmojiConfetti({
  count = 80,
  durationMs = 2200,
  emojis = ["🎉", "✨", "🎊", "💫", "🌟"],
}: EmojiConfettiProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100; // vw
      const delay = Math.random() * 0.6; // s
      const rotate = Math.random() * 360;
      const scale = 0.8 + Math.random() * 0.8;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const duration = (durationMs / 1000) * (0.85 + Math.random() * 0.4); // s
      const opacity = 0.75 + Math.random() * 0.25;
      return { id: i, left, delay, rotate, scale, emoji, duration, opacity };
    });
  }, [count, durationMs, emojis]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
      {/* Local keyframes */}
      <style>{`
        @keyframes emoji-fall {
          0% { transform: translate3d(0, -110%, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate3d(0, 110vh, 0) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {items.map((item) => (
        <span
          key={item.id}
          aria-hidden
          style={{
            position: "absolute",
            top: "-10%",
            left: `${item.left}vw`,
            animation: `emoji-fall ${item.duration}s ease-in ${item.delay}s 1 both`,
            transform: `translate3d(0, -110%, 0) rotate(${item.rotate}deg) scale(${item.scale})`,
            fontSize: `${18 + Math.random() * 22}px`,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))",
            opacity: item.opacity,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>,
    document.body
  );
}
