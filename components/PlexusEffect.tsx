"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

export default function PlexusEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isViewable = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Detect mobile characteristics
    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    const particleCount = isMobile ? 35 : 100;
    const connectionDistanceLimit = 125;
    const mouseConnectionDistanceLimit = 200;

    // Adjust canvas resolution for high-DPI displays (retina screens)
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      // Re-initialize particles on resize to avoid clustering
      initParticles(rect.width, rect.height);
    };

    const initParticles = (width: number, height: number) => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Small organic movement velocity
          vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.6),
          vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.6),
          radius: Math.random() * 2 + 1,
          baseAlpha: Math.random() * 0.4 + 0.5,
        });
      }
    };

    // Initialize dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    initParticles(rect.width, rect.height);
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    // Mouse Tracking Event Listeners (only enabled on desktop/coarse-less devices)
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    // Animation Loop
    const draw = () => {
      if (!isViewable.current) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Update positions and apply mouse attraction (magnetic gravity effect)
      particles.forEach((p) => {
        // Apply magnetic gravity towards cursor if nearby
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouseConnectionDistanceLimit) {
            const pullForce = (mouseConnectionDistanceLimit - dist) / mouseConnectionDistanceLimit;
            // Add slight acceleration towards mouse
            p.vx += (dx / dist) * pullForce * 0.05;
            p.vy += (dy / dist) * pullForce * 0.05;
          }
        }

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;

        // Limit velocity to keep movements graceful
        const maxSpeed = isMobile ? 0.4 : 0.8;
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > maxSpeed) {
          p.vx = (p.vx / currentSpeed) * maxSpeed;
          p.vy = (p.vy / currentSpeed) * maxSpeed;
        }

        // Boundary bounce / wrap
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Keep inside bounds
        if (p.x < 0) p.x = 0;
        if (p.x > width) p.x = width;
        if (p.y < 0) p.y = 0;
        if (p.y > height) p.y = height;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Soft violet/blue aura for node
        ctx.fillStyle = `rgba(167, 139, 250, ${p.baseAlpha})`;
        ctx.fill();
      });

      // Draw Connection Lines between particle nodes
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistanceLimit) {
            // Farther distance = lower opacity
            const alpha = (1 - dist / connectionDistanceLimit) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Purple/blue gradient connection lines
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Draw active hover lines connecting kursor to nearby particles
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseConnectionDistanceLimit) {
            const alpha = (1 - dist / mouseConnectionDistanceLimit) * 0.65;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            
            // Brighter neon-purple line for active cursor connections
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 1.25;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // IntersectionObserver to pause loop when Hero section is out of screen
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isViewable.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observerRef.current.observe(canvas);

    // Start Animation Loop
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      if (!isMobile) {
        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-100"
    />
  );
}
