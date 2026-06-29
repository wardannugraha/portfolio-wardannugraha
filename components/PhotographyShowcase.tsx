"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Play } from "lucide-react";
import Image from "next/image";
import { parseEmbedUrl } from "@/lib/embedParser";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Media {
  id: string;
  title: string;
  url: string;
  description: string | null;
  categoryId: string | null;
  category: Category | null;
  isFeatured: boolean;
}

interface PhotographyShowcaseProps {
  initialMedia: Media[];
}

const tabs = [
  { name: "Photography", slug: "photography" },
  { name: "Video Editing", slug: "video-editing" },
  { name: "Design & Visuals", slug: "graphic-design" },
];

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const getRows = (items: Media[]) => {
  const count = items.length;
  const rows = [];
  for (let i = 0; i < count; i += 4) {
    rows.push(items.slice(i, i + 4));
  }
  return rows;
};

const getFlexWeights = (rowCount: number) => {
  if (rowCount === 4) {
    return [1.2, 0.8, 1.3, 0.7];
  }
  if (rowCount === 3) {
    return [1.2, 0.8, 1.0];
  }
  if (rowCount === 2) {
    return [1.2, 0.8];
  }
  return Array(rowCount).fill(1);
};

const VideoCard = ({ video }: { video: Media }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      onMouseEnter={() => videoRef.current?.play().catch(() => { })}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className="w-full h-full relative"
    >
      <video
        ref={videoRef}
        src={video.url}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-75 ease-out"
      />
      {/* Play Icon overlay */}
      <div className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/10 text-white z-20 transition-transform duration-300 group-hover:scale-110">
        <Play className="w-4 h-4 fill-white text-white" />
      </div>
    </div>
  );
};

export default function PhotographyShowcase({ initialMedia }: PhotographyShowcaseProps) {
  const [selectedTab, setSelectedTab] = useState("photography");
  const [activePhoto, setActivePhoto] = useState<Media | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Listen to URL search param on load (e.g. /?tab=video-editing)
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      setSelectedTab(tabParam);
    }

    const handleFilterChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { slug, sectionId } = customEvent.detail;
      if (sectionId === "gallery") {
        setSelectedTab(slug);
      }
    };

    window.addEventListener("filter-change", handleFilterChange);
    return () => {
      window.removeEventListener("filter-change", handleFilterChange);
    };
  }, []);

  // Filter media files based on active tab
  const filteredMedia = initialMedia.filter(
    (item) => item.category?.slug === selectedTab
  );

  return (
    <section id="gallery" className="pt-16 pb-24 border-t border-white/5 relative bg-transparent overflow-hidden">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Creative Gallery</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-white">Creative Media Showcase</h2>
          </div>
          <p className="text-zinc-400 max-w-md text-sm sm:text-base font-light">
            A curated showcase of photography, cinematography, and graphic designs expressing visual stories.
          </p>
        </div>

        {/* Tab Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 w-full mb-12">
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setSelectedTab(tab.slug)}
                className="relative px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-300 flex items-center gap-2 cursor-pointer outline-none border border-white/5"
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeGalleryTabIndicator"
                    className="absolute inset-0 bg-white rounded-full z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isSelected ? "text-black" : "text-zinc-400 hover:text-white"}`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Visual Flex/Grid Layout */}
        {filteredMedia.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-3xl">
            <p className="text-zinc-500 text-sm font-light">No media found in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Flex Accordion Layout */}
            <div className="hidden md:flex flex-col gap-4 w-full">
              {getRows(filteredMedia).map((row, rowIndex) => {
                const flexWeights = getFlexWeights(row.length);
                return (
                  <div
                    key={`row-${rowIndex}`}
                    className="flex flex-row gap-4 w-full h-[250px] md:h-[300px] items-stretch"
                  >
                    {row.map((item, index) => {
                      const [mediaUrl, userCoverUrl] = item.url.split("||");
                      const parsedMedia = parseEmbedUrl(mediaUrl);
                      const isExternalMedia = parsedMedia.isExternal;
                      
                      const isVideo = item.category?.slug === "video-editing" || parsedMedia.type === "youtube" || parsedMedia.type === "vimeo" || parsedMedia.type === "instagram" || parsedMedia.type === "tiktok";
                      const isDirectVideo = isVideo && !isExternalMedia;
                      const coverImageSrc = isExternalMedia
                        ? (userCoverUrl || parsedMedia.thumbnailUrl || "/uploads/default-media.jpg")
                        : (userCoverUrl || mediaUrl);

                      const isHovered = hoveredId === item.id;
                      const isAnyHoveredInRow = row.some((r) => r.id === hoveredId);

                      // Calculate active flex weight
                      let flexValue = flexWeights[index];
                      if (hoveredId !== null) {
                        if (isHovered) {
                          flexValue = row.length === 4 ? 2.2 : row.length === 3 ? 2.0 : 1.5;
                        } else if (isAnyHoveredInRow) {
                          flexValue = row.length === 4 ? 0.6 : row.length === 3 ? 0.5 : 0.5;
                        }
                      }

                      return (
                        <div
                          key={item.id}
                          style={{
                            flex: flexValue,
                            transition: "flex 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease"
                          }}
                          onMouseEnter={() => setHoveredId(item.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => setActivePhoto(item)}
                          className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-zinc-950 hover:border-white/15 hover:shadow-xl hover:shadow-violet-950/10"
                        >
                          {isDirectVideo ? (
                            <VideoCard video={{ ...item, url: mediaUrl }} />
                          ) : (
                            <div className="w-full h-full relative">
                              <Image
                                src={coverImageSrc}
                                alt={item.title}
                                fill
                                sizes="(max-width: 1024px) 33vw, 25vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              />
                              {isVideo && (
                                <div className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/10 text-white z-20 transition-transform duration-300 group-hover:scale-110">
                                  <Play className="w-4 h-4 fill-white text-white" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Vignette Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent opacity-65 group-hover:opacity-85 transition-opacity duration-500" />

                          {/* Text Content Overlay */}
                          <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end pointer-events-none z-10">
                            <span className="text-[9px] font-semibold tracking-widest uppercase text-rose-400">
                              {item.category?.name || "Creative Media"}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5 transition-all duration-300">
                              {item.title}
                              <ZoomIn className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
                            </h3>
                            {item.description && (
                              <p className="text-zinc-300 text-[11px] mt-1.5 font-light leading-relaxed max-h-0 overflow-hidden group-hover:max-h-16 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Mobile Grid Layout (2 columns) */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {filteredMedia.map((item) => {
                const [mediaUrl, userCoverUrl] = item.url.split("||");
                const parsedMedia = parseEmbedUrl(mediaUrl);
                const isExternalMedia = parsedMedia.isExternal;
                
                const isVideo = item.category?.slug === "video-editing" || parsedMedia.type === "youtube" || parsedMedia.type === "vimeo" || parsedMedia.type === "instagram" || parsedMedia.type === "tiktok";
                const isDirectVideo = isVideo && !isExternalMedia;
                const coverImageSrc = isExternalMedia
                  ? (userCoverUrl || parsedMedia.thumbnailUrl || "/uploads/default-video.jpg")
                  : (userCoverUrl || mediaUrl);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActivePhoto(item)}
                    className="group relative rounded-xl overflow-hidden border border-white/5 bg-zinc-950 aspect-[4/3] cursor-pointer"
                  >
                    {isDirectVideo ? (
                      <VideoCard video={{ ...item, url: mediaUrl }} />
                    ) : (
                      <div className="w-full h-full relative">
                        <Image
                          src={coverImageSrc}
                          alt={item.title}
                          fill
                          sizes="50vw"
                          className="object-cover"
                        />
                        {isVideo && (
                          <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 border border-white/10 text-white z-20">
                            <Play className="w-3.5 h-3.5 fill-white text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3" />

                    {/* Caption Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end pointer-events-none z-10">
                      <span className="text-[8px] font-semibold tracking-wider uppercase text-rose-400">
                        {item.category?.name || "Creative"}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-0.5 truncate">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Overlay Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            onClick={() => setActivePhoto(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 rounded-full bg-white/5 border border-white/5 transition-colors cursor-pointer"
              onClick={() => setActivePhoto(null)}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Lightbox Image/Video Box Container */}
            {(() => {
              const [mediaUrl, userCoverUrl] = activePhoto.url.split("||");
              const parsedMedia = parseEmbedUrl(mediaUrl);
              const isExternal = parsedMedia.isExternal;
              
              const isVideo = activePhoto.category?.slug === "video-editing" || parsedMedia.type === "youtube" || parsedMedia.type === "vimeo" || parsedMedia.type === "instagram" || parsedMedia.type === "tiktok";
              const isDirectVideo = isVideo && !isExternal;

              // Instagram and TikTok embeds look better with portrait/vertical aspect ratio
              const isVerticalEmbed = isExternal && (parsedMedia.type === "instagram" || parsedMedia.type === "tiktok");
              const boxAspectClass = isExternal 
                ? (isVerticalEmbed ? "aspect-[9/16] max-w-[340px] h-[75vh]" : "aspect-video")
                : (isDirectVideo ? "aspect-video" : "aspect-[4/5] sm:aspect-auto sm:h-[70vh]");

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`relative max-w-5xl max-h-[75vh] w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center ${boxAspectClass}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isExternal && parsedMedia.embedUrl ? (
                    <iframe
                      src={parsedMedia.embedUrl}
                      title={activePhoto.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-none rounded-2xl"
                    />
                  ) : isDirectVideo ? (
                    <video
                      src={mediaUrl}
                      controls
                      autoPlay
                      className="w-full h-full max-h-[70vh] rounded-2xl object-contain"
                    />
                  ) : (
                    <Image
                      src={mediaUrl}
                      alt={activePhoto.title}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      priority
                    />
                  )}
                </motion.div>
              );
            })()}

            {/* Image caption text footer */}
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center max-w-md w-full px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white">{activePhoto.title}</h3>
              {activePhoto.description && (
                <p className="text-zinc-400 text-sm mt-1 font-light">{activePhoto.description}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
