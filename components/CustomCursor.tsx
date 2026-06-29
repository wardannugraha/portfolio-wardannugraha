"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Handle mounting and screen size detection
  useEffect(() => {
    setMounted(true);

    const checkDeviceCapability = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(hasTouch || isSmallScreen);
    };

    checkDeviceCapability();
    window.addEventListener("resize", checkDeviceCapability);

    return () => {
      window.removeEventListener("resize", checkDeviceCapability);
    };
  }, []);

  // 2. Mouse tracking and state listeners
  useEffect(() => {
    if (!mounted || isMobile) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "IFRAME" || target.closest("iframe") || target.tagName === "SELECT" || target.closest("select"))) {
        setIsVisible(false);
        setIsHovered(false);
      } else {
        mouseX = e.clientX;
        mouseY = e.clientY;
        setIsVisible(true);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Dynamic hover handler using event delegation
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isHiddenElement = target.tagName === "IFRAME" || target.closest("iframe") || target.tagName === "SELECT" || target.closest("select");
      if (isHiddenElement) {
        setIsVisible(false);
        setIsHovered(false);
        return;
      }

      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".cursor-pointer") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("[role='button']");

      setIsHovered(!!isInteractive);
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Smooth physics translation using lerp loop
    let animFrameId: number;
    const updatePosition = () => {
      // Immediate response for dot
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;

      // Trailing spring lag for outer ring
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.left = `${dotX}px`;
        dotRef.current.style.top = `${dotY}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }

      animFrameId = requestAnimationFrame(updatePosition);
    };

    animFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animFrameId);
    };
  }, [mounted, isMobile]);

  if (!mounted || isMobile) return null;

  return (
    <>
      {/* Trailing Outer Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform transition-[width,height,background-color,opacity] duration-300 ease-out ${
          isHovered
            ? "w-14 h-14 bg-white"
            : isClicked
            ? "w-4 h-4 bg-white"
            : "w-8 h-8 bg-white"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
      />
      {/* Precision Center Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform transition-[width,height,opacity] duration-200 ease-out ${
          isHovered ? "w-1.5 h-1.5 opacity-60" : isClicked ? "w-1 h-1" : "w-1.5 h-1.5"
        } ${isVisible ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
