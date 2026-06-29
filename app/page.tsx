export const dynamic = "force-dynamic";

import Hero from "@/components/Hero";
import { ArrowUpRight, Mail, Phone, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProjectShowcase from "@/components/ProjectShowcase";
import SkillsGrid from "@/components/SkillsGrid";
import PhotographyShowcase from "@/components/PhotographyShowcase";
import CommunityImpact from "@/components/CommunityImpact";
import TiltCard from "@/components/TiltCard";

// Fallback mock data in case the database is not seeded or encounters a connection issue
const FALLBACK_MEDIA = [
  // Photography
  {
    id: "fb-m1",
    title: "Urban Dreamscape",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80",
    description: "Night photography capturing neon reflection on wet city streets.",
    category: { name: "Photography", slug: "photography" },
    isFeatured: true,
  },
  {
    id: "fb-m2",
    title: "Ethereal Nature",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80",
    description: "Moody forest visual focusing on morning light breaking through tree leaves.",
    category: { name: "Photography", slug: "photography" },
    isFeatured: true,
  },
  {
    id: "fb-m3",
    title: "Mystic Mountains",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    description: "Towering mountain peaks draped in low-hanging atmospheric clouds.",
    category: { name: "Photography", slug: "photography" },
    isFeatured: true,
  },
  {
    id: "fb-m4",
    title: "Architectural Lines",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    description: "Sleek, modern minimalist residential architecture elements.",
    category: { name: "Photography", slug: "photography" },
    isFeatured: true,
  },
  {
    id: "fb-m5",
    title: "Street Lights",
    url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80",
    description: "Golden hour long-exposure street photography visuals.",
    category: { name: "Photography", slug: "photography" },
    isFeatured: true,
  },
  {
    id: "fb-m6",
    title: "Coastal Mist",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    description: "A calming ocean view with a long exposure soft shoreline.",
    category: { name: "Photography", slug: "photography" },
    isFeatured: true,
  },
  // Videography
  {
    id: "fb-m7",
    title: "Cinematic Drone Reel",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "4K aerial footage and video editing showcase.",
    category: { name: "Video Editing", slug: "video-editing" },
    isFeatured: true,
  },
  {
    id: "fb-m8",
    title: "Abstract Motion Loop",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "Moody motion graphics and creative pacing adjustments.",
    category: { name: "Video Editing", slug: "video-editing" },
    isFeatured: true,
  },
  {
    id: "fb-m9",
    title: "Wildlife Story",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Cinematic documentary pacing and nature capture.",
    category: { name: "Video Editing", slug: "video-editing" },
    isFeatured: true,
  },
  {
    id: "fb-m10",
    title: "Ocean Wave Reel",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "Fluid transitions and high-frame-rate water visual cuts.",
    category: { name: "Video Editing", slug: "video-editing" },
    isFeatured: true,
  },
  // Design & Visuals
  {
    id: "fb-m11",
    title: "Minimalist Branding Identity",
    url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    description: "Modern layout and packaging identity assets.",
    category: { name: "Graphic Design", slug: "graphic-design" },
    isFeatured: true,
  },
  {
    id: "fb-m12",
    title: "Creative Event Poster",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
    description: "High-contrast poster design utilizing bold typography and shapes.",
    category: { name: "Graphic Design", slug: "graphic-design" },
    isFeatured: true,
  },
  {
    id: "fb-m13",
    title: "Typography Experiments",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    description: "Playful graphic layouts exploring hierarchy and fonts.",
    category: { name: "Graphic Design", slug: "graphic-design" },
    isFeatured: true,
  },
  {
    id: "fb-m14",
    title: "Cyberpunk UI Design",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
    description: "Glowing abstract interface elements and HUD designs.",
    category: { name: "Graphic Design", slug: "graphic-design" },
    isFeatured: true,
  },
];

const FALLBACK_PROJECTS = [
  {
    id: "fb-1",
    title: "E-Commerce Platform",
    description: "A fast, modern headless e-commerce store built with Next.js App Router and Prisma.",
    featuredImage: "/uploads/ecommerce.jpg",
    category: { name: "Web Development" },
  },
  {
    id: "fb-2",
    title: "Dreamscape Visuals Portfolio",
    description: "Premium photography case study presenting the best of landscape and urban snaps.",
    featuredImage: "/uploads/uikit.jpg",
    category: { name: "Photography" },
  },
];

const FALLBACK_ACHIEVEMENTS = [
  {
    id: "ac-1",
    title: "Next.js Advanced Developer",
    issuer: "Vercel / Next.js Academy",
    description: "Verification of full-stack engineering skills using modern frameworks.",
    date: new Date("2025-08-15"),
  },
];

const FALLBACK_COMMUNITY = [
  {
    id: "cm-1",
    title: "Law Debate Competition",
    role: "1st Place Winner / Champion",
    organization: "Debate Association & Contests",
    dateRange: "2024",
    description: "Awarded Champion in competitive debate, demonstrating advanced verbal articulation, structured legal argumentation, and critical thinking.",
  },
  {
    id: "cm-2",
    title: "West Java Literacy Ambassador (Duta Baca)",
    role: "Top 10 Finalist",
    organization: "Provincial Library & Archives Office",
    dateRange: "2024",
    description: "Recognized as a Top 10 ambassador at the provincial level, advocating reading programs and speaking at educational seminars.",
  },
  {
    id: "cm-3",
    title: "Cianjur Literacy Ambassador (Duta Baca)",
    role: "2nd Place Winner",
    organization: "Regional Library Department",
    dateRange: "2023",
    description: "Awarded second place in the regional ambassador program, helping initiate local book circles and creative youth campaigns.",
  },
];

const FALLBACK_SKILLS = [
  { name: "Next.js", level: "Advanced", category: "Technology" },
  { name: "TypeScript", level: "Advanced", category: "Technology" },
  { name: "Figma", level: "Advanced", category: "Creative" },
  { name: "Adobe Premiere", level: "Advanced", category: "Creative" },
];

export default async function Home() {
  // Fetch data dynamically on the server
  let projects: any[] = [];
  let achievements: any[] = [];
  let community: any[] = [];
  let skills: any[] = [];
  let media: any[] = [];
  let aboutMeSetting: any = null;
  let contactLinksSetting: any = null;
  let displayAboutName = "Wardan Nugraha Ahmad";
  let displayAboutPhoto = "";
  let parsedSkillCategories: string[] = [];

  try {
    projects = await prisma.project.findMany({
      include: { category: true },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" }
      ],
    });
    achievements = await prisma.achievement.findMany({
      orderBy: { date: "desc" },
    });
    community = await prisma.communityActivity.findMany({
      orderBy: { createdAt: "desc" },
    });
    skills = await prisma.skill.findMany({
      orderBy: { category: "asc" },
    });
    media = await prisma.media.findMany({
      include: { category: true },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" }
      ],
    });
    aboutMeSetting = await prisma.siteSetting.findUnique({
      where: { key: "about_me" },
    });
    const aboutNameSetting = await prisma.siteSetting.findUnique({
      where: { key: "about_name" },
    });
    const aboutPhotoSetting = await prisma.siteSetting.findUnique({
      where: { key: "about_photo" },
    });
    const skillCategoriesSetting = await prisma.siteSetting.findUnique({
      where: { key: "skill_categories" },
    });
    contactLinksSetting = await prisma.siteSetting.findUnique({
      where: { key: "contact_links" },
    });

    displayAboutName = aboutNameSetting?.value || "Wardan Nugraha Ahmad";
    displayAboutPhoto = aboutPhotoSetting?.value || "";
    if (skillCategoriesSetting?.value) {
      try {
        parsedSkillCategories = JSON.parse(skillCategoriesSetting.value);
      } catch (e) {
        console.error("Error parsing skill categories:", e);
      }
    }
  } catch (error) {
    console.error("Database connection warning (using local fallbacks):", error);
  }

  let parsedContactLinks: { label: string; url: string; icon: string; username?: string }[] = [];
  if (contactLinksSetting?.value) {
    try {
      parsedContactLinks = JSON.parse(contactLinksSetting.value);
    } catch (e) {
      console.error("Error parsing contact links:", e);
    }
  }

  if (!parsedContactLinks || parsedContactLinks.length === 0) {
    parsedContactLinks = [
      { label: "Email", url: "mailto:contact@wardannugraha.com", icon: "mail" },
      { label: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
      { label: "WhatsApp", url: "https://wa.me/6281234567890", icon: "phone" }
    ];
  }

  const defaultAboutMe = "I am a builder and creator working at the intersection of technology and creative design. My core commercial passion lies in building next-generation web applications, designing premium user experiences, and exploring visual storytelling. To strengthen my skills and build leadership, I actively participate in collegiate debate competitions, provincial literacy advocacy roles, and pursue industry-recognized technical credentials.";

  // Fallback triggers if the database returns empty sets (which is standard before seed)
  const displayProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS;
  const displayAchievements = achievements.length > 0 ? achievements : FALLBACK_ACHIEVEMENTS;
  const displayCommunity = community.length > 0 ? community : FALLBACK_COMMUNITY;
  const displaySkills = skills.length > 0 ? skills : FALLBACK_SKILLS;
  const displayMedia = media.length > 0 ? media : FALLBACK_MEDIA;
  const displayAboutMe = aboutMeSetting?.value || defaultAboutMe;

  return (
    <div className="flex flex-col min-h-screen bg-grid-pattern bg-[#030303] relative overflow-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Work Section (Focus: Technology & Creative Core Business) */}
      <section id="work" className="pt-24 pb-16 border-t border-white/5 relative bg-transparent overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Portfolio</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-white">Featured Works</h2>
            </div>
            <p className="text-zinc-400 max-w-md text-sm sm:text-base font-light">
              A curated selection of core technology projects and creative design highlights.
            </p>
          </div>

          <ProjectShowcase initialProjects={displayProjects} />
        </div>
      </section>

      {/* Photography Showcase (Focus: Creative/Creator Gallery) */}
      <PhotographyShowcase initialMedia={displayMedia} />

      {/* About Section (Focus: Synthesized Identity & Achievements) */}
      <section id="about" className="py-24 border-t border-white/5 relative bg-transparent overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/4 left-10 w-[350px] h-[350px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <TiltCard src={displayAboutPhoto} alt={displayAboutName} />
            </div>
            <div className="md:col-span-7 flex flex-col gap-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Identity Story</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">{displayAboutName}</h2>
              <p className="text-zinc-300 font-light leading-relaxed whitespace-pre-line">
                {displayAboutMe}
              </p>
              
              <div className="space-y-4 w-full">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Core Expertise</h4>
                <SkillsGrid initialSkills={displaySkills} categoryOrder={parsedSkillCategories} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section (Focus: Learner Authority Builder) */}
      <section id="credentials" className="py-24 border-t border-white/5 relative bg-transparent overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Education & Certs</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-white">Academic & Professional Credentials</h2>
            </div>
            <p className="text-zinc-400 max-w-md text-sm sm:text-base font-light">
              Technical verifications, credentials, and certifications validating domain expertise.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {displayAchievements.slice(0, 4).map((ach) => (
              <Link
                key={ach.id}
                href={`/credentials/${ach.id}`}
                className="glass-card p-3 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-between h-36 sm:h-48 hover:border-amber-500/30 hover:scale-[1.02] transition-all duration-300 group md:cursor-none relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] sm:text-xs font-medium text-amber-400">Certification</span>
                    <ArrowUpRight className="hidden sm:block w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors duration-300 mt-0.5 flex-shrink-0" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-semibold text-white mt-1 sm:mt-2 leading-tight group-hover:text-amber-300 transition-colors duration-300 line-clamp-2">{ach.title}</h3>
                  <p className="hidden sm:block text-zinc-500 text-xs mt-1 font-light line-clamp-2">{ach.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2 sm:mt-4 gap-2">
                  <span className="text-[9px] sm:text-xs text-zinc-500 truncate max-w-[60%]">{ach.issuer}</span>
                  {ach.date && (
                    <span className="text-[8px] sm:text-[10px] text-zinc-600 bg-white/5 border border-white/5 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                      {new Date(ach.date).toLocaleDateString("id-ID", { year: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements & Organizations Section (Focus: Learner & Contributor Personal Brand) */}
      <CommunityImpact initialActivities={displayCommunity.slice(0, 4)} />

      {/* Contact Section / Footer */}
      <footer id="contact" className="py-16 border-t border-white/5 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Let&apos;s Build Something Beautiful Together</h2>
          <p className="text-zinc-400 max-w-md text-sm font-light">
            Open for freelance opportunities, full-time roles, or collaborating on digital media and web products.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {parsedContactLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all duration-300 flex items-center gap-3 md:cursor-none shadow-lg group hover:scale-[1.03]"
              >
                <div className="p-2 rounded-xl bg-white/5 text-violet-400 group-hover:bg-violet-500 group-hover:text-black transition-colors duration-300">
                  {getContactIcon(link.icon)}
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 block font-semibold uppercase tracking-wider">
                    {link.username ? link.label : "Get in touch via"}
                  </span>
                  <span className="text-sm font-bold block">
                    {link.username ? link.username : link.label}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors ml-2 self-start mt-0.5" />
              </a>
            ))}
          </div>
          <span className="text-xs text-zinc-600 mt-12">
            &copy; {new Date().getFullYear()} Wardan Nugraha Ahmad. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

function getContactIcon(iconName: string) {
  switch (iconName) {
    case "mail":
      return <Mail className="w-5 h-5" />;
    case "phone":
      return <Phone className="w-5 h-5" />;
    case "linkedin":
      return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    case "github":
      return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      );
    case "instagram":
      return (
        <svg role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      );
    case "globe":
    default:
      return <Globe className="w-5 h-5" />;
  }
}
