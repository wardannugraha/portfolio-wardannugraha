"use client";

import React, { useRef, useState } from "react";

interface TiltCardProps {
  src?: string;
  alt: string;
}

export default function TiltCard({ src, alt }: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [shineStyle, setShineStyle] = useState<React.CSSProperties>({
    opacity: 0,
    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)",
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = containerRef.current;
    if (!card) return;

    setIsHovering(true);

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to the center of the card
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Calculate rotation angle (max 15 degrees tilt)
    // Vertical mouse movement tilts around the X-axis (rotateX)
    // Horizontal mouse movement tilts around the Y-axis (rotateY)
    const rX = -(mouseY / (height / 2)) * 12;
    const rY = (mouseX / (width / 2)) * 12;

    setRotateX(rX);
    setRotateY(rY);

    // Calculate mouse position as percentage of card width and height for shine gradient
    const shineX = ((e.clientX - rect.left) / width) * 100;
    const shineY = ((e.clientY - rect.top) / height) * 100;

    setShineStyle({
      opacity: 0.25, // Subtle but noticeable shine overlay
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)`,
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Smoothly reset back to neutral
    setRotateX(0);
    setRotateY(0);
    setShineStyle((prev) => ({
      ...prev,
      opacity: 0,
    }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-square w-full rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center preserve-3d"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        boxShadow: isHovering
          ? "0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 30px 1px rgba(139, 92, 246, 0.1)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
        transition: isHovering
          ? "transform 0.05s ease-out, box-shadow 0.3s ease"
          : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Outer ambient glow inside the card */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 to-transparent opacity-60 z-0 pointer-events-none" 
        style={{ transform: "translateZ(-10px)" }}
      />

      {/* The image/portrait */}
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover relative z-10 pointer-events-none select-none"
          style={{
            transform: isHovering ? "translateZ(30px)" : "translateZ(0px)",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      ) : (
        <span 
          className="text-xs text-zinc-500 font-light relative z-10 select-none"
          style={{
            transform: isHovering ? "translateZ(20px)" : "translateZ(0px)",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {alt} Portrait
        </span>
      )}

      {/* Dynamic Shine Layer */}
      <div
        className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        style={shineStyle}
      />

      {/* Border overlay with depth highlights */}
      <div 
        className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none z-30" 
        style={{
          transform: "translateZ(15px)",
          borderColor: isHovering ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.08)",
          transition: "border-color 0.3s ease",
        }}
      />
    </div>
  );
}
