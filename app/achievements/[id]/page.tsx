import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Globe, Calendar, Tag, ShieldAlert, Play, Camera, FileText, Layout, Award, Users } from "lucide-react";
import React from "react";
import { parseEmbedUrl } from "@/lib/embedParser";

export const dynamic = "force-dynamic";

interface AchievementDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AchievementDetailPage({ params }: AchievementDetailPageProps) {
  const { id } = await params;

  let activity = null;
  try {
    activity = await prisma.communityActivity.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching achievement details:", error);
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Activity Not Found</h1>
        <p className="text-zinc-500 text-sm max-w-sm mb-8 font-light">
          The achievement or organization activity you are looking for does not exist or has been removed.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-white text-zinc-950 rounded-xl text-sm font-semibold transition-colors hover:bg-zinc-200"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Parse dynamic links
  let activityLinks: { label: string; url: string; icon: string }[] = [];
  const rawLinks = activity.links;
  if (rawLinks) {
    try {
      activityLinks = JSON.parse(rawLinks);
    } catch (e) {
      console.error("Failed to parse activity links:", e);
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 pb-24 pt-28 relative overflow-hidden">
      {/* Background radial glow with emerald tint */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-500/5 via-emerald-600/0 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/#achievements"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold group/back md:cursor-none"
          >
            <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-0.5 transition-transform" />
            Back to Achievements
          </Link>
          
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
            <Award className="w-3.5 h-3.5" />
            Honor & Activity
          </span>
        </div>

        {/* Header Block */}
        <div className="space-y-4">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
            {activity.role}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {activity.title}
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* Featured Image (If exists) */}
        {activity.image && (
          <div className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-950 relative aspect-video w-full shadow-2xl">
            <img
              src={activity.image}
              alt={activity.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Grid Meta & Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-white/5 pb-2">
              Activity Details & Background
            </h2>
            
            <div className="space-y-2">
              {activity.content ? (
                parseMarkdown(activity.content)
              ) : (
                <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">
                  No detailed description has been written for this activity yet. Please check the links on the side for details.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar / Links */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 sticky top-28 shadow-xl">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 border-b border-white/5 pb-2">
                  Activity Info
                </h3>
                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-semibold uppercase tracking-wider">Role</span>
                    <span className="text-zinc-300 font-medium mt-1 block">{activity.role}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-semibold uppercase tracking-wider">Organization</span>
                    <span className="text-zinc-300 font-medium mt-1 block flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      {activity.organization}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-semibold uppercase tracking-wider">Time Period</span>
                    <span className="text-zinc-300 font-medium mt-1 block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {activity.dateRange}
                    </span>
                  </div>
                </div>
              </div>

              {activityLinks.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-white/5">
                  {activityLinks.map((link, index) => {
                    const isPrimary = index === 0;
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          isPrimary
                            ? "w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 md:cursor-none shadow-md"
                            : "w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 md:cursor-none"
                        }
                      >
                        {getLinkIcon(link.icon)}
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple dynamic inline elements compiler (bold text & links)
function parseInline(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const matches = text.split(regex);

  return matches.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    } else if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const labelEnd = part.indexOf("]");
      const urlStart = part.indexOf("(") + 1;
      const label = part.substring(1, labelEnd);
      const url = part.substring(urlStart, part.length - 1);
      return (
        <a 
          key={i} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-emerald-400 hover:text-emerald-300 underline font-medium inline-flex items-center gap-0.5 md:cursor-none"
        >
          {label} <span className="text-[10px]">&#8599;</span>
        </a>
      );
    }
    return part;
  });
}

// Lightweight custom Markdown renderer
function parseMarkdown(text: string | null) {
  if (!text) return null;

  const lines = text.split("\n");
  const listItems: React.ReactNode[] = [];
  const elements: React.ReactNode[] = [];

  const pushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 my-4 space-y-2 text-zinc-300 text-sm sm:text-base">
          {[...listItems]}
        </ul>
      );
      listItems.length = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("### ")) {
      pushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold mt-8 mb-3 text-white tracking-tight">
          {parseInline(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      pushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-extrabold mt-10 mb-4 text-white border-b border-white/5 pb-2 tracking-tight">
          {parseInline(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      pushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold mt-12 mb-6 text-white tracking-tight">
          {parseInline(line.substring(2))}
        </h1>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(
        <li key={`li-${i}`} className="leading-relaxed font-light">
          {parseInline(line.substring(2))}
        </li>
      );
    } else if (line.startsWith("![") && line.includes("](") && line.endsWith(")")) {
      pushList();
      const altStart = 2;
      const altEnd = line.indexOf("]");
      const urlStart = line.indexOf("(") + 1;
      const urlEnd = line.length - 1;
      const alt = line.substring(altStart, altEnd);
      const url = line.substring(urlStart, urlEnd);

      const embedInfo = parseEmbedUrl(url);

      if (embedInfo.isExternal && embedInfo.embedUrl) {
        const isVertical = embedInfo.type === "instagram" || embedInfo.type === "tiktok";
        const aspectClass = isVertical ? "aspect-[9/16] max-w-sm mx-auto" : "aspect-video";

        elements.push(
          <div key={`embed-${i}`} className={`my-8 rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40 relative ${aspectClass} w-full flex items-center justify-center shadow-lg`}>
            <iframe
              src={embedInfo.embedUrl}
              title={alt}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>
        );
      } else if (embedInfo.type === "direct") {
        elements.push(
          <div key={`video-${i}`} className="my-8 rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40 relative aspect-video w-full flex items-center justify-center shadow-lg">
            <video src={url} controls className="w-full h-full object-contain" />
          </div>
        );
      } else {
        elements.push(
          <div key={`img-${i}`} className="my-8 rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40 relative aspect-video sm:max-h-[450px] w-full flex items-center justify-center shadow-lg">
            <img
              src={url}
              alt={alt}
              className="object-cover w-full h-full"
            />
          </div>
        );
      }
    } else if (line === "") {
      pushList();
      elements.push(<div key={`space-${i}`} className="h-4" />);
    } else {
      pushList();
      elements.push(
        <p key={`p-${i}`} className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
          {parseInline(line)}
        </p>
      );
    }
  }

  pushList();
  return elements;
}

function getLinkIcon(iconType: string) {
  switch (iconType) {
    case "github":
      return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      );
    case "camera":
      return <Camera className="w-4 h-4" />;
    case "video":
      return <Play className="w-4 h-4 fill-current" />;
    case "file":
      return <FileText className="w-4 h-4" />;
    case "layout":
      return <Layout className="w-4 h-4" />;
    case "link":
    default:
      return <Globe className="w-4 h-4" />;
  }
}
