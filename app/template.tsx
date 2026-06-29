"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        ease: [0.16, 1, 0.3, 1], // easeOutExpo for ultra-smooth transition
        duration: 0.55,
      }}
      className="w-full flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}
