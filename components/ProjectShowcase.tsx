"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Code, Camera, Sparkles, Layout, Video, Paintbrush, ChevronLeft, ChevronRight, Globe, Play, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  content: string | null;
  featuredImage: string;
  demoUrl: string | null;
  githubUrl: string | null;
  links: string | null;
  categoryId: string;
  category: Category;
  isFeatured: boolean;
}

interface ProjectShowcaseProps {
  initialProjects: Project[];
}

const filterCategories = [
  { name: "All", slug: "all", icon: Sparkles },
  { name: "Web Dev", slug: "web-dev", icon: Code },
  { name: "UI/UX", slug: "ui-ux", icon: Layout },
  { name: "AI / ML", slug: "ai-ml", icon: Sparkles },
  { name: "Photography", slug: "photography", icon: Camera },
  { name: "Video Editing", slug: "video-editing", icon: Video },
  { name: "Design", slug: "graphic-design", icon: Paintbrush },
];

export default function ProjectShowcase({ initialProjects }: ProjectShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Max 2 rows of 4 columns on desktop

  useEffect(() => {
    // Listen to URL search param on load (e.g. /?filter=web-dev)
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      setSelectedCategory(filterParam);
    }

    const handleFilterChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { slug, sectionId } = customEvent.detail;
      if (sectionId === "work") {
        setSelectedCategory(slug);
      }
    };
    
    window.addEventListener("filter-change", handleFilterChange);
    return () => {
      window.removeEventListener("filter-change", handleFilterChange);
    };
  }, []);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const filteredProjects = selectedCategory === "all"
    ? initialProjects
    : initialProjects.filter(p => p.category.slug === selectedCategory);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smoothly scroll back to the #work section header so the user doesn't stay stuck at the bottom
    const element = document.getElementById("work");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      {/* Category Pills Header */}
      <div className="flex flex-wrap justify-center gap-3 w-full">
        {filterCategories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className="relative px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2 cursor-pointer outline-none border border-white/5"
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-white rounded-full z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2 ${isSelected ? "text-black" : "text-zinc-400 hover:text-white"}`}>
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-12">
        <AnimatePresence>
          {filteredProjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-16 text-center glass-card rounded-3xl"
            >
              <p className="text-zinc-500 text-sm font-light">No projects found in this category yet.</p>
            </motion.div>
          ) : (
            displayedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 group cursor-pointer relative overflow-hidden flex flex-col justify-between"
              >
                <Link href={`/projects/${project.id}`} className="block md:cursor-none flex-1">
                  {/* Visual Image Preview */}
                  <div className="aspect-video w-full rounded-xl sm:rounded-2xl bg-zinc-950 border border-white/5 mb-3 sm:mb-6 flex items-center justify-center relative overflow-hidden">
                    <Image
                      src={project.featuredImage}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                  </div>

                  {/* Details Footer */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[9px] sm:text-xs font-semibold text-violet-400 uppercase tracking-wider">
                        {project.category.name}
                      </span>
                      <h3 className="text-xs sm:text-base md:text-xl font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="hidden sm:block text-zinc-400 text-sm font-light line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    </div>
                    
                    <div className="hidden sm:flex w-10 h-10 rounded-full border border-white/10 items-center justify-center group-hover:bg-white group-hover:text-black transition-all flex-shrink-0 ml-4">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>

                {/* Demo and Github Buttons / Custom Dynamic Links if available */}
                {(() => {
                  const projectLinks: { label: string; url: string; icon: string }[] = [];
                  if (project.links) {
                    try {
                      const parsed = JSON.parse(project.links);
                      if (Array.isArray(parsed)) {
                        projectLinks.push(...parsed);
                      }
                    } catch (e) {
                      console.error("Failed to parse project links:", e);
                    }
                  }

                  // Fallback if links is empty but demoUrl or githubUrl exist
                  if (projectLinks.length === 0) {
                    if (project.demoUrl) {
                      projectLinks.push({
                        label: "Live Demo",
                        url: project.demoUrl,
                        icon: "link",
                      });
                    }
                    if (project.githubUrl) {
                      projectLinks.push({
                        label: "Source Code",
                        url: project.githubUrl,
                        icon: "github",
                      });
                    }
                  }

                  if (projectLinks.length === 0) return null;

                  return (
                    <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-2 mt-6 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                      {projectLinks.map((link, idx) => {
                        const isPrimary = idx === 0;
                        return (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs font-semibold inline-flex items-center gap-1.5 md:cursor-none transition-colors ${
                              isPrimary
                                ? "text-white hover:text-violet-300"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {getLinkIcon(link.icon)}
                            <span>{link.label}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                          </a>
                        );
                      })}
                    </div>
                  );
                })()}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-8 border-t border-white/5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-400 disabled:hover:border-white/10 transition-all cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase select-none">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-400 disabled:hover:border-white/10 transition-all cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

function getLinkIcon(iconType: string) {
  switch (iconType) {
    case "github":
      return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-current">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      );
    case "camera":
      return <Camera className="w-3.5 h-3.5" />;
    case "video":
      return <Play className="w-3.5 h-3.5 fill-current" />;
    case "file":
      return <FileText className="w-3.5 h-3.5" />;
    case "layout":
      return <Layout className="w-3.5 h-3.5" />;
    case "link":
    default:
      return <Globe className="w-3.5 h-3.5" />;
  }
}
