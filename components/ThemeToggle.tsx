"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Render placeholder to avoid layout shift before hydration
    return (
      <div
        className={`w-9 h-9 rounded-full bg-zinc-800/40 border border-white/5 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center gap-2 p-2 rounded-full backdrop-blur-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer ${
        isDark
          ? "bg-zinc-900/80 border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          : "bg-white/90 border-zinc-200 hover:border-amber-400/80 text-zinc-700 hover:text-zinc-950 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
      } ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Ambient Glow Aura */}
      <span
        className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          isDark
            ? "bg-gradient-to-r from-violet-600/30 to-indigo-600/30"
            : "bg-gradient-to-r from-amber-400/30 to-orange-400/30"
        }`}
      />

      {/* Animated Icon Container */}
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 22,
              }}
              className="flex items-center justify-center text-violet-400"
            >
              <Moon className="w-4 h-4 fill-violet-400/20 stroke-[2]" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 22,
              }}
              className="flex items-center justify-center text-amber-500"
            >
              <Sun className="w-4 h-4 fill-amber-400/30 stroke-[2]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-medium pr-2 text-zinc-700 dark:text-zinc-300">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}
