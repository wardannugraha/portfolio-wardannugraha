"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Palette, Sliders, Globe, Award } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: string | null;
  category: string;
}

interface SkillsGridProps {
  initialSkills: Skill[];
  categoryOrder?: string[];
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "technology":
    case "tech":
    case "code":
      return Cpu;
    case "creative":
    case "design":
    case "media":
      return Palette;
    case "soft skills":
    case "leadership":
    case "softskills":
      return Award;
    case "languages":
    case "language":
      return Globe;
    default:
      return Sliders;
  }
};

const getLevelPercentage = (level: string | null): number => {
  if (!level) return 50;
  const parsed = parseInt(level, 10);
  if (!isNaN(parsed)) return parsed; // If it's a numeric string e.g. "85"
  
  // Fallback for legacy text values
  const l = level.toLowerCase();
  if (l === "expert") return 95;
  if (l === "advanced") return 85;
  if (l === "intermediate") return 65;
  if (l === "beginner") return 45;
  return 50;
};

export default function SkillsGrid({ initialSkills, categoryOrder = [] }: SkillsGridProps) {
  // Get unique categories dynamically
  const rawCategories = initialSkills.length > 0
    ? Array.from(new Set(initialSkills.map(s => s.category)))
    : ["Technology", "Creative"];

  // Sort them based on categoryOrder
  const categories = [...rawCategories].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1; // Unordered items go to the end
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const [activeTab, setActiveTab] = useState<string>(categories[0] || "Technology");

  const filteredSkills = initialSkills.filter(
    (skill) => skill.category.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="space-y-8 w-full">
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-4 border-b border-white/5 pb-4">
        {categories.map((catName) => {
          const Icon = getCategoryIcon(catName);
          const isActive = activeTab.toLowerCase() === catName.toLowerCase();
          return (
            <button
              key={catName}
              onClick={() => setActiveTab(catName)}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase pb-2 transition-all relative cursor-pointer ${
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {catName}
              {isActive && (
                <motion.div
                  layoutId="activeSkillTabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid of skills cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <AnimatePresence>
          {filteredSkills.map((skill) => {
            const percentage = getLevelPercentage(skill.level);
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-3.5 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col justify-between border border-white/5 hover:border-white/15"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-white text-xs sm:text-base">{skill.name}</h4>
                  <span className="text-violet-400 text-[10px] sm:text-sm font-semibold">{percentage}%</span>
                </div>

                {/* Highly visual glowing progress bar rating */}
                <div className="w-full bg-white/5 h-1 sm:h-1.5 rounded-full overflow-hidden mt-2.5 sm:mt-4 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-violet-500 to-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
