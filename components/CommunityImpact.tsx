"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Heart, Award, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface CommunityActivity {
  id: string;
  title: string;
  role: string;
  organization: string;
  dateRange: string;
  description: string | null;
  image: string | null;
  content?: string | null;
  links?: string | null;
}

interface CommunityImpactProps {
  initialActivities: CommunityActivity[];
}

export default function CommunityImpact({ initialActivities }: CommunityImpactProps) {
  // Helper to determine icon based on title/role
  const getActivityIcon = (title: string, role: string) => {
    const text = (title + " " + role).toLowerCase();
    if (text.includes("baca") || text.includes("literasi") || text.includes("book")) {
      return BookOpen;
    }
    if (text.includes("debate") || text.includes("debat") || text.includes("law") || text.includes("speak")) {
      return Award;
    }
    if (text.includes("volunteer") || text.includes("sosial") || text.includes("social")) {
      return Heart;
    }
    if (text.includes("duta") || text.includes("ambassador") || text.includes("award")) {
      return Award;
    }
    return Users;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  return (
    <section id="achievements" className="py-24 border-t border-white/5 relative bg-transparent overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Leadership & Honors</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-white">Achievements & Organizations</h2>
          </div>
          <p className="text-zinc-400 max-w-md text-sm sm:text-base font-light">
            A history of competition awards, leadership milestones, and active engagement in student and public organizations.
          </p>
        </div>

        {/* Visual Contributions Timeline / Bento Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
        >
          {initialActivities.length === 0 ? (
            <div className="col-span-full py-16 text-center glass-card rounded-3xl">
              <p className="text-zinc-500 text-sm font-light">No community activities found. Manage them in your seeder!</p>
            </div>
          ) : (
            initialActivities.map((act) => {
              const Icon = getActivityIcon(act.title, act.role);
              return (
                <Link
                  key={act.id}
                  href={`/achievements/${act.id}`}
                  className="md:cursor-none"
                >
                  <motion.div
                    variants={itemVariants}
                    className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300 h-full"
                  >
                    <div className="space-y-3.5">
                      {/* Header with visual icon pill */}
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 sm:p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                          <Icon className="w-3.5 h-3.5 sm:w-4.5 h-4.5" />
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-medium text-zinc-500 bg-white/5 border border-white/5 px-1.5 sm:px-2.5 py-0.5 rounded-full">
                          {act.dateRange}
                        </span>
                      </div>

                      {/* Meta info */}
                      <div>
                        <span className="text-[8px] sm:text-[10px] font-semibold text-emerald-400 tracking-wider uppercase block truncate">
                          {act.role}
                        </span>
                        <h3 className="text-xs sm:text-base font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2" title={act.title}>
                          {act.title}
                        </h3>
                        <p className="text-zinc-500 text-[9px] sm:text-[11px] mt-0.5 font-medium truncate">
                          at {act.organization}
                        </p>
                      </div>

                      {/* Description */}
                      {act.description && (
                        <p className="hidden sm:block text-zinc-400 text-xs font-light leading-relaxed line-clamp-3">
                          {act.description}
                        </p>
                      )}
                    </div>

                    {/* Decorative corner arrow link indicators */}
                    <div className="mt-3 sm:mt-6 flex items-center justify-between border-t border-white/5 pt-2 sm:pt-3.5 text-[9px] sm:text-[11px] font-medium text-zinc-500 group-hover:text-emerald-400 transition-colors">
                      <span>Honor & Activity</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                    </div>
                  </motion.div>
                </Link>
              );
            })
          )}
        </motion.div>
      </div>
    </section>
  );
}
