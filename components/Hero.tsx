"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Code, Camera, BookOpen, Award } from "lucide-react";
import PlexusEffect from "@/components/PlexusEffect";

const badges = [
  { 
    name: "Creative Media", 
    desc: "Photo, Video & Design", 
    icon: Camera, 
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    backDesc: "Producing high-quality visual content through landscape photography, creative video editing, and graphic design.",
    href: "#gallery"
  },
  { 
    name: "Creative Tech", 
    desc: "Apps, UI/UX & AI", 
    icon: Code, 
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    backDesc: "Building modern web applications, designing intuitive UI/UX layouts, and integrating intelligent machine learning models.",
    href: "#work"
  },
  { 
    name: "Credentials", 
    desc: "Education & Certs", 
    icon: Award, 
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    backDesc: "Academic background in computer science along with verified professional certifications and leadership achievements.",
    href: "#credentials"
  },
  { 
    name: "Achievements", 
    desc: "Awards & Milestones", 
    icon: BookOpen, 
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    backDesc: "A history of competitive honors, leadership awards, and notable milestones earned across multiple disciplines.",
    href: "#achievements"
  },
];

function BentoCard({ badge }: { badge: typeof badges[0] }) {
  const Icon = badge.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const [glareCoords, setGlareCoords] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlareCoords({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setGlareCoords(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <a 
      href={badge.href} 
      className="flip-card w-full h-28 sm:h-44 relative block cursor-pointer group"
    >
      <div className="flip-card-inner w-full h-full">
        
        {/* Front Face of Card */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flip-card-front absolute inset-0 p-3 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 sm:gap-3 bg-zinc-950/95 border border-white/5 hover:border-white/10 transition-colors duration-300 overflow-hidden"
        >
          {/* Glare sheen overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: glareCoords.opacity,
              background: `radial-gradient(120px circle at ${glareCoords.x}px ${glareCoords.y}px, rgba(139, 92, 246, 0.12), transparent 80%)`,
            }}
          />

          <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl border ${badge.color}`}>
            <Icon className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <span className="font-bold text-xs sm:text-base text-zinc-100 tracking-tight">{badge.name}</span>
          <span className="text-[9px] sm:text-xs text-zinc-400 font-normal">{badge.desc}</span>
        </div>

        {/* Back Face of Card */}
        <div className="flip-card-back absolute inset-0 p-3 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 sm:gap-3 bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors duration-300">
          <span className="text-[9px] sm:text-xs font-bold tracking-wider uppercase text-violet-400">
            {badge.name}
          </span>
          <p className="text-[8px] sm:text-xs text-zinc-300 leading-tight sm:leading-relaxed font-light px-1">
            {badge.backDesc}
          </p>
          <span className="text-[8px] sm:text-[10px] text-violet-400 font-medium tracking-wide mt-1 group-hover:underline">
            Explore Section &rarr;
          </span>
        </div>

      </div>
    </a>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mouseCoords, setMouseCoords] = useState({ x: -1000, y: -1000 });


  // Tracking mouse movement across the Hero section to reveal the grid spotlights
  const handleSectionMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMouseCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 120,
      },
    },
  };

  return (
    <section 
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#030303]"
    >
      {/* Plexus Canvas Background */}
      <PlexusEffect />
      {/* Dynamic Aurora Blobs */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0"
      />

      {/* Giant Typographic Marquee */}
      <div className="absolute top-1/3 left-0 w-full overflow-hidden pointer-events-none opacity-20 select-none z-0">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity,
          }}
          className="flex whitespace-nowrap text-[8vw] font-black uppercase text-transparent tracking-tighter"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.02)" }}
        >
          <span>CREATOR • BUILDER • CONTRIBUTOR • DEBATER •&nbsp;</span>
          <span>CREATOR • BUILDER • CONTRIBUTOR • DEBATER •&nbsp;</span>
          <span>CREATOR • BUILDER • CONTRIBUTOR • DEBATER •&nbsp;</span>
        </motion.div>
      </div>
      
      {/* Spotlight revealed background Grid Mesh */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-grid-pattern opacity-60"
        style={{
          maskImage: `radial-gradient(350px circle at ${mouseCoords.x}px ${mouseCoords.y}px, black 20%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(350px circle at ${mouseCoords.x}px ${mouseCoords.y}px, black 20%, transparent 100%)`,
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
        <motion.div
          variants={sentence}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          {/* Tagline */}
          <motion.span
            variants={wordVariants}
            className="text-xs font-semibold tracking-widest uppercase text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 rounded-full z-10 animate-pulse"
          >
            Creative Technologist & Creator
          </motion.span>

          {/* Preheader name introduction */}
          <motion.p
            variants={wordVariants}
            className="text-zinc-500 font-semibold text-xs sm:text-sm tracking-widest uppercase z-10"
          >
            Hi, I&apos;m Wardan Nugraha Ahmad
          </motion.p>

          {/* Staggered Word Reveal Headline (leading adjusted to 1.18 to prevent descender clipping) */}
          <motion.h1
            variants={wordVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.18] text-white z-10 pb-2"
          >
            {"Creating Digital Experiences ".split(" ").map((w, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block mr-2.5 pb-3">
                {w}
              </motion.span>
            ))}
            <br />
            {"Through Design, Code & Visual Storytelling".split(" ").map((w, i) => {
              const isGradient = w.includes("Design,") || w.includes("Code") || w.includes("Visual") || w.includes("Storytelling") || w.includes("&");
              return (
                <motion.span 
                  key={i} 
                  variants={wordVariants} 
                  className={`inline-block mr-2.5 pb-3 ${isGradient ? "gradient-text-purple-blue" : ""}`}
                >
                  {w}
                </motion.span>
              );
            })}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={wordVariants}
            className="text-zinc-400 text-base sm:text-lg max-w-xl leading-relaxed font-light z-10"
          >
            I craft elegant solutions by bridging the gap between design and technology. 
            Designing, building, and contributing to high-impact digital products.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={wordVariants} className="flex flex-col sm:flex-row gap-4 mt-2 z-10">
            <a
              href="#work"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg inline-flex items-center justify-center gap-2 group cursor-pointer"
            >
              Explore My Work
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>
            
            <a
              href="#about"
              className="glass-card hover:bg-white/10 text-white font-medium px-8 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center cursor-pointer"
            >
              Read My Story
            </a>
          </motion.div>

          {/* Bento Badges (using 3D Flip Cards Y-Axis) */}
          <motion.div
            variants={wordVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 w-full max-w-4xl mt-12 pt-8 border-t border-white/5 z-10"
          >
            {badges.map((badge) => (
              <BentoCard key={badge.name} badge={badge} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
