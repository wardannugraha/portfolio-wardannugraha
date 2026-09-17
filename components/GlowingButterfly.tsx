"use client";

import { useEffect, useRef, useState } from "react";

interface MicroStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number; // 1.2px - 2.4px (delicate & subtle)
  rotation: number;
  rotSpeed: number;
  offsetAngle: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  orbitSpeed: number;
  pulsePhase: number;
  alpha: number;
  color: string;
  glowColor: string;
}

interface StardustSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isCross: boolean;
}

interface StarCluster {
  id: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  baseSpeed: number;
  angle: number;
  angularVelocity: number;
  targetAngle: number;
  wanderSeed: number;
  harmonics: { freq1: number; amp1: number; freq2: number; amp2: number };
  age: number;
  stars: MicroStar[];
}

const MAX_CLUSTERS = 2;
const SPAWN_INTERVAL_MS = 16000;
const INITIAL_DELAY_MS = 3200;
const MOUSE_ATTRACT_RADIUS = 135;

// Diverse curated color palettes
const COLOR_PALETTES = [
  {
    name: "cyan",
    stars: ["#00f0ff", "#38bdf8", "#0284c7", "#0ea5e9"],
    glow: "rgba(14, 165, 233, 0.45)",
  },
  {
    name: "violet",
    stars: ["#c084fc", "#a855f7", "#ec4899", "#d946ef"],
    glow: "rgba(168, 85, 247, 0.45)",
  },
  {
    name: "gold",
    stars: ["#fbbf24", "#f59e0b", "#d97706", "#f59e0b"],
    glow: "rgba(245, 158, 11, 0.45)",
  },
  {
    name: "emerald",
    stars: ["#34d399", "#10b981", "#059669", "#10b981"],
    glow: "rgba(16, 185, 129, 0.45)",
  },
  {
    name: "rose",
    stars: ["#fb7185", "#f43f5e", "#e11d48", "#f43f5e"],
    glow: "rgba(244, 63, 94, 0.45)",
  },
  {
    name: "azure",
    stars: ["#818cf8", "#6366f1", "#3b82f6", "#4f46e5"],
    glow: "rgba(99, 102, 241, 0.45)",
  },
  {
    name: "prismatic",
    stars: ["#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#f43f5e"],
    glow: "rgba(99, 102, 241, 0.45)",
  },
];

function getTransparentColor(colorStr: string): string {
  if (colorStr.startsWith("rgba")) {
    return colorStr.replace(/[\d\.]+\)$/, "0)");
  }
  if (colorStr.startsWith("#")) {
    const hex = colorStr.replace("#", "");
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, 0)`;
  }
  return "rgba(255, 255, 255, 0)";
}

export default function GlowingButterfly() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clustersRef = useRef<StarCluster[]>([]);
  const stardustRef = useRef<StardustSparkle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const isTabVisibleRef = useRef<boolean>(true);
  const idCounterRef = useRef<number>(1);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);

    const handleVisibilityChange = () => {
      isTabVisibleRef.current = document.visibilityState === "visible";
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();

    const initialTimer = setTimeout(() => {
      if (isTabVisibleRef.current) {
        spawnCluster();
      }
    }, INITIAL_DELAY_MS);

    spawnTimerRef.current = setInterval(() => {
      if (isTabVisibleRef.current && clustersRef.current.length < MAX_CLUSTERS) {
        spawnCluster();
      }
    }, SPAWN_INTERVAL_MS);

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resizeCanvas);
      clearTimeout(initialTimer);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const spawnCluster = () => {
    if (clustersRef.current.length >= MAX_CLUSTERS) return;

    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    // Pick a random entry edge (left, right, top-left, bottom-left, etc.)
    const entrySide = Math.random();
    let startX = 0;
    let startY = 0;
    let baseAngle = 0;

    if (entrySide < 0.45) {
      // Enter from Left at random angle
      startX = -40;
      startY = Math.random() * (vh * 0.7) + vh * 0.1;
      baseAngle = (Math.random() - 0.5) * 0.8; // -23deg to +23deg
    } else if (entrySide < 0.9) {
      // Enter from Right at random angle
      startX = vw + 40;
      startY = Math.random() * (vh * 0.7) + vh * 0.1;
      baseAngle = Math.PI + (Math.random() - 0.5) * 0.8;
    } else if (entrySide < 0.95) {
      // Enter from Top
      startX = Math.random() * (vw * 0.8) + vw * 0.1;
      startY = -40;
      baseAngle = Math.PI * 0.5 + (Math.random() - 0.5) * 0.9;
    } else {
      // Enter from Bottom
      startX = Math.random() * (vw * 0.8) + vw * 0.1;
      startY = vh + 40;
      baseAngle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.9;
    }

    // Pick randomized color palette
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

    // 5-8 micro stars in the cluster
    const starCount = Math.floor(Math.random() * 4) + 5;
    const stars: MicroStar[] = [];

    const baseSpeed = Math.random() * 0.8 + 2.3; // 2.3 - 3.1 px/frame (brisk & graceful)

    for (let i = 0; i < starCount; i++) {
      const isLeadStar = i === 0;
      const radius = isLeadStar ? 2.4 : Math.random() * 0.7 + 1.2;

      const starColor = palette.stars[Math.floor(Math.random() * palette.stars.length)];

      stars.push({
        x: startX + (Math.random() - 0.5) * 26,
        y: startY + (Math.random() - 0.5) * 26,
        vx: Math.cos(baseAngle) * baseSpeed,
        vy: Math.sin(baseAngle) * baseSpeed,
        radius,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() * 0.04 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
        offsetAngle: Math.random() * Math.PI * 2,
        orbitRadiusX: isLeadStar ? 0 : Math.random() * 20 + 6,
        orbitRadiusY: isLeadStar ? 0 : Math.random() * 16 + 4,
        orbitSpeed: (Math.random() * 0.03 + 0.015) * (Math.random() > 0.5 ? 1 : -1),
        pulsePhase: Math.random() * Math.PI * 2,
        alpha: 0.8 + Math.random() * 0.2,
        color: starColor,
        glowColor: palette.glow,
      });
    }

    const cluster: StarCluster = {
      id: idCounterRef.current++,
      cx: startX,
      cy: startY,
      vx: Math.cos(baseAngle) * baseSpeed,
      vy: Math.sin(baseAngle) * baseSpeed,
      baseSpeed,
      angle: baseAngle,
      targetAngle: baseAngle,
      angularVelocity: 0,
      wanderSeed: Math.random() * 100,
      harmonics: {
        freq1: Math.random() * 1.5 + 1.2,
        amp1: Math.random() * 0.12 + 0.06,
        freq2: Math.random() * 2.8 + 2.0,
        amp2: Math.random() * 0.06 + 0.02,
      },
      age: 0,
      stars,
    };

    clustersRef.current.push(cluster);
  };

  const animateLoop = (now: number) => {
    const delta = Math.min(now - lastTimeRef.current, 32);
    lastTimeRef.current = now;

    if (!isTabVisibleRef.current) {
      animFrameRef.current = requestAnimationFrame(animateLoop);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      animFrameRef.current = requestAnimationFrame(animateLoop);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(animateLoop);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    if (canvas.width !== vw * dpr || canvas.height !== vh * dpr) {
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);

    const mouse = mouseRef.current;
    const hasMouse = mouse.x !== null && mouse.y !== null;
    const clusters = clustersRef.current;
    const stardust = stardustRef.current;

    // 1. Update and Draw Micro Stardust Particles
    for (let i = stardust.length - 1; i >= 0; i--) {
      const p = stardust[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.size = Math.max(0, p.size - 0.03);

      if (p.alpha <= 0 || p.size <= 0) {
        stardust.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.isCross && p.size > 0.9) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - p.size * 1.4, p.y);
        ctx.lineTo(p.x + p.size * 1.4, p.y);
        ctx.moveTo(p.x, p.y - p.size * 1.4);
        ctx.lineTo(p.x, p.y + p.size * 1.4);
        ctx.stroke();

        ctx.fillStyle = isDark ? "#ffffff" : p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. Update and Draw Randomized Flying Clusters
    for (let cIdx = clusters.length - 1; cIdx >= 0; cIdx--) {
      const cluster = clusters[cIdx];
      cluster.age += delta * 0.001;

      let mouseAttracted = false;

      if (hasMouse) {
        const mdx = mouse.x! - cluster.cx;
        const mdy = mouse.y! - cluster.cy;
        const dist = Math.hypot(mdx, mdy);

        if (dist < MOUSE_ATTRACT_RADIUS) {
          mouseAttracted = true;
          const pull = ((MOUSE_ATTRACT_RADIUS - dist) / MOUSE_ATTRACT_RADIUS) * 0.15;
          cluster.vx += (mdx / dist) * pull;
          cluster.vy += (mdy / dist) * pull;

          // Smooth curved vortex orbit
          const swirlDir = cluster.vx >= 0 ? 1 : -1;
          cluster.vx += (-mdy / dist) * 0.09 * swirlDir;
          cluster.vy += (mdx / dist) * 0.09 * swirlDir;

          cluster.angle = Math.atan2(cluster.vy, cluster.vx);
        }
      }

      if (!mouseAttracted) {
        // Multi-frequency organic wandering (not a single predictable pattern!)
        const h = cluster.harmonics;
        const waveOffset =
          Math.sin(cluster.age * h.freq1 + cluster.wanderSeed) * h.amp1 +
          Math.cos(cluster.age * h.freq2 + cluster.wanderSeed * 1.5) * h.amp2;

        cluster.targetAngle = cluster.angle + waveOffset;

        // Smooth angular steering
        cluster.angle += (cluster.targetAngle - cluster.angle) * 0.04;

        const targetVx = Math.cos(cluster.angle) * cluster.baseSpeed;
        const targetVy = Math.sin(cluster.angle) * cluster.baseSpeed;

        cluster.vx += (targetVx - cluster.vx) * 0.04;
        cluster.vy += (targetVy - cluster.vy) * 0.04;
      }

      cluster.vx *= 0.98;
      cluster.vy *= 0.98;

      cluster.cx += cluster.vx;
      cluster.cy += cluster.vy;

      // Update and Draw Each Micro Star in Cluster
      for (let sIdx = 0; sIdx < cluster.stars.length; sIdx++) {
        const star = cluster.stars[sIdx];
        star.offsetAngle += star.orbitSpeed;
        star.rotation += star.rotSpeed;
        star.pulsePhase += 0.05;

        // Dynamic wandering orbit relative to cluster center
        const targetX =
          cluster.cx +
          Math.cos(star.offsetAngle) * star.orbitRadiusX +
          Math.sin(star.pulsePhase + sIdx) * 3;
        const targetY =
          cluster.cy +
          Math.sin(star.offsetAngle) * star.orbitRadiusY +
          Math.cos(star.pulsePhase * 1.2 + sIdx) * 3;

        const dx = targetX - star.x;
        const dy = targetY - star.y;

        star.vx += dx * 0.05;
        star.vy += dy * 0.05;

        star.vx *= 0.91;
        star.vy *= 0.91;

        star.x += star.vx;
        star.y += star.vy;

        // Emit micro stardust sparks
        if (Math.random() < 0.22) {
          stardust.push({
            x: star.x + (Math.random() - 0.5) * 3,
            y: star.y + (Math.random() - 0.5) * 3,
            vx: (Math.random() - 0.5) * 0.4 - cluster.vx * 0.15,
            vy: (Math.random() - 0.5) * 0.4 - cluster.vy * 0.15,
            size: Math.random() * 1.1 + 0.6,
            alpha: 0.9,
            decay: Math.random() * 0.035 + 0.025,
            color: Math.random() > 0.45 ? star.color : (isDark ? "#ffffff" : star.color),
            isCross: Math.random() > 0.6,
          });
        }

        // Draw 4-Point Micro Star Flare
        const pulse = 0.88 + Math.sin(star.pulsePhase) * 0.12;
        const r = star.radius * pulse;

        // Soft Radiant Glow (Seamless transparent color stop without black/gray halo)
        const transparentGlow = getTransparentColor(star.glowColor);
        const glowGrad = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          r * 3.6
        );
        glowGrad.addColorStop(0, star.color);
        glowGrad.addColorStop(0.35, star.glowColor);
        glowGrad.addColorStop(1, transparentGlow);

        ctx.fillStyle = glowGrad;
        ctx.globalAlpha = star.alpha * (isDark ? 0.6 : 0.35);
        ctx.beginPath();
        ctx.arc(star.x, star.y, r * 3.6, 0, Math.PI * 2);
        ctx.fill();

        // 4-Point Star Flare
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.rotation);

        const flareLength = r * 2.3;
        const flareInner = r * 0.35;

        ctx.fillStyle = isDark ? "#ffffff" : star.color;
        ctx.globalAlpha = star.alpha * 0.95;
        if (isDark) {
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 4;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.moveTo(0, -flareLength);
        ctx.quadraticCurveTo(0, -flareInner, flareInner, 0);
        ctx.quadraticCurveTo(flareInner, 0, flareLength, 0);
        ctx.quadraticCurveTo(flareInner, 0, 0, flareInner);
        ctx.quadraticCurveTo(0, flareInner, 0, flareLength);
        ctx.quadraticCurveTo(0, flareInner, -flareInner, 0);
        ctx.quadraticCurveTo(-flareInner, 0, -flareLength, 0);
        ctx.quadraticCurveTo(-flareInner, 0, 0, -flareInner);
        ctx.quadraticCurveTo(0, -flareInner, 0, -flareLength);
        ctx.closePath();
        ctx.fill();

        // Center Core
        ctx.fillStyle = isDark ? "#ffffff" : "#ffffff";
        ctx.globalAlpha = isDark ? 1 : 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Despawn check when out of view
      const isOffLeft = cluster.cx < -80;
      const isOffRight = cluster.cx > vw + 80;
      const isOffTop = cluster.cy < -80;
      const isOffBottom = cluster.cy > vh + 80;

      if ((isOffLeft || isOffRight || isOffTop || isOffBottom) && !mouseAttracted && cluster.age > 3) {
        clusters.splice(cIdx, 1);
      }
    }

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(animateLoop);
  };

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-screen h-screen select-none"
      aria-hidden="true"
    />
  );
}
