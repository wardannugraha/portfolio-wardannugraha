"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const updatePosition = () => {
      // Smooth interpolation (lerp)
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;

      if (glow) {
        glow.style.left = `${currentX}px`;
        glow.style.top = `${currentY}px`;
        glow.style.transform = "translate(-50%, -50%)";
      }

      requestAnimationFrame(updatePosition);
    };

    const animFrame = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow pointer-events-none fixed mix-blend-screen opacity-100 hidden md:block"
      style={{ left: "-9999px", top: "-9999px", transform: "translate(-50%, -50%)" }}
    />
  );
}
