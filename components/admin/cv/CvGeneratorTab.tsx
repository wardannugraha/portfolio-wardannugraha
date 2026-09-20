"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Save,
  Printer,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
  Sparkles,
  User,
  Briefcase,
  FolderGit2,
  Wrench,
  GraduationCap,
  Award,
  ChevronRight,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { CvProfileData, CvExperience, CvEducation, CvProjectItem, CvSkillGroup } from "./types";
import CvA4Document from "./CvA4Document";

interface CvGeneratorTabProps {
  initialProjects: any[];
  initialSkills: any[];
  initialAchievements: any[];
  initialAboutMe: string;
  initialAboutName: string;
  initialAboutPhoto: string;
  initialContactLinks: string;
  initialCvProfilesData?: string;
  onSaveSetting?: (key: string, value: string) => Promise<boolean>;
}

export default function CvGeneratorTab({
  initialProjects,
  initialSkills,
  initialAchievements,
  initialAboutMe,
  initialAboutName,
  initialAboutPhoto,
  initialContactLinks,
  initialCvProfilesData,
  onSaveSetting,
}: CvGeneratorTabProps) {
  // Parse contact links from setting
  let parsedContacts = { email: "", phone: "", linkedin: "", github: "", location: "Bandung, Indonesia", website: "https://wardannugraha.my.id" };
  try {
    if (initialContactLinks) {
      const parsed = JSON.parse(initialContactLinks);
      parsedContacts = { ...parsedContacts, ...parsed };
    }
  } catch (e) {}

  // Helper to construct default skills grouping from DB skills
  const getDefaultSkillGroups = (): CvSkillGroup[] => {
    const grouped: Record<string, string[]> = {};
    initialSkills.forEach((s) => {
      const cat = s.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s.name);
    });

    const groups: CvSkillGroup[] = Object.entries(grouped).map(([categoryName, skills], idx) => ({
      id: `group-${idx}-${Date.now()}`,
      categoryName,
      skills,
    }));

    if (groups.length === 0) {
      return [
        { id: "1", categoryName: "Frontend & Fullstack", skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Prisma", "PostgreSQL"] },
        { id: "2", categoryName: "UI/UX & Product Design", skills: ["Figma", "Design Systems", "Wireframing", "User Flow", "Interactive Prototyping"] },
        { id: "3", categoryName: "Tools & Methodologies", skills: ["Git", "Docker", "RESTful API", "Agile / Scrum", "Vercel"] },
      ];
    }
    return groups;
  };

  // Helper to construct default project list from DB projects
  const getDefaultProjects = (): CvProjectItem[] => {
    return initialProjects.map((p, idx) => ({
      id: `proj-${p.id || idx}`,
      projectId: p.id,
      title: p.title,
      role: "Lead Developer & Designer",
      period: new Date(p.createdAt || Date.now()).getFullYear().toString(),
      tools: p.category?.name ? [p.category.name] : ["Next.js", "TypeScript"],
      link: p.demoUrl || p.githubUrl || "",
      bullets: [
        p.description || "Designed and engineered fullstack digital solution with modern reactive architecture.",
      ],
      selected: idx < 3, // Select top 3 by default
    }));
  };

  // Initial default profiles
  const createDefaultProfiles = (): CvProfileData[] => [
    {
      id: "preset-webdev",
      profileName: "Fullstack Web Developer",
      targetRole: "Fullstack Web Developer & Creative Technologist",
      fullName: initialAboutName || "Wardan Nugraha Ahmad",
      email: parsedContacts.email || "wardannugraha@gmail.com",
      phone: parsedContacts.phone || "+62 812-3456-7890",
      location: parsedContacts.location || "Bandung, Indonesia",
      websiteUrl: parsedContacts.website || "https://wardannugraha.my.id",
      linkedinUrl: parsedContacts.linkedin || "https://linkedin.com/in/wardan-nugraha",
      githubUrl: parsedContacts.github || "https://github.com/wardannugraha",
      showPhoto: false,
      photoUrl: initialAboutPhoto || "",
      summary:
        initialAboutMe ||
        "Detail-oriented Fullstack Developer with strong foundations in modern web ecosystems (Next.js, TypeScript, PostgreSQL). Passionate about crafting high-performance, accessible, and aesthetically rich digital experiences with end-to-end reliability.",
      experiences: [
        {
          id: "exp-1",
          role: "Fullstack Developer & System Builder",
          company: "Independent / Freelance",
          location: "Remote / Bandung",
          startDate: "2023",
          endDate: "Present",
          isCurrent: true,
          bullets: [
            "Architected and deployed production web applications leveraging Next.js App Router, Prisma ORM, and Tailwind CSS with sub-second page loads.",
            "Engineered responsive, highly interactive user interfaces featuring customized 3D micro-interactions and smooth scroll physics.",
            "Integrated secure RESTful APIs, database schema management, and automated continuous deployment workflows.",
          ],
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "Universitas / Institute",
          degree: "Bachelor of Computer Science / Engineering",
          fieldOfStudy: "Informatics",
          location: "Indonesia",
          startDate: "2020",
          endDate: "2024",
          gpa: "3.80 / 4.00",
          description: "Graduated with honors. Active in software engineering research and technological innovation.",
        },
      ],
      projects: getDefaultProjects(),
      skillGroups: getDefaultSkillGroups(),
      achievements: initialAchievements.map((a) => `${a.title} - ${a.issuer || ""}`),
      fontFamily: "Inter",
      fontSize: "md",
      spacingDensity: "normal",
      accentColor: "#09090b",
      showDividers: true,
    },
    {
      id: "preset-uiux",
      profileName: "UI/UX & Product Designer",
      targetRole: "UI/UX Designer & Product Interface Specialist",
      fullName: initialAboutName || "Wardan Nugraha Ahmad",
      email: parsedContacts.email || "wardannugraha@gmail.com",
      phone: parsedContacts.phone || "+62 812-3456-7890",
      location: parsedContacts.location || "Bandung, Indonesia",
      websiteUrl: parsedContacts.website || "https://wardannugraha.my.id",
      linkedinUrl: parsedContacts.linkedin || "https://linkedin.com/in/wardan-nugraha",
      githubUrl: parsedContacts.github || "https://github.com/wardannugraha",
      showPhoto: false,
      photoUrl: initialAboutPhoto || "",
      summary:
        "User-centric UI/UX Designer bridging user research, wireframing, and interactive design systems into seamless digital products. Experienced in Figma component architectures, heuristic evaluation, and responsive design systems.",
      experiences: [
        {
          id: "exp-ui-1",
          role: "UI/UX & Product Designer",
          company: "Creative Digital Studio",
          location: "Bandung, Indonesia",
          startDate: "2023",
          endDate: "Present",
          isCurrent: true,
          bullets: [
            "Conducted user interviews, journey mapping, and competitive analysis to formulate clear user flows and high-fidelity wireframes.",
            "Created and maintained scalable Figma Design Systems with auto-layout, variables, and interactive prototypes for developer handoff.",
            "Improved usability task completion rates by 35% through iterative prototype testing and user feedback loops.",
          ],
        },
      ],
      education: [
        {
          id: "edu-ui-1",
          school: "Universitas / Institute",
          degree: "Bachelor Degree",
          fieldOfStudy: "Design & Technology",
          location: "Indonesia",
          startDate: "2020",
          endDate: "2024",
          gpa: "",
          description: "",
        },
      ],
      projects: getDefaultProjects().map((p, i) => ({
        ...p,
        role: "UI/UX Designer & Researcher",
        bullets: [
          "Developed end-to-end design system, wireframing, interactive prototypes, and usability testing protocols.",
        ],
        selected: i < 2,
      })),
      skillGroups: [
        {
          id: "ui-skills-1",
          categoryName: "Design & Prototyping",
          skills: ["Figma", "Wireframing", "Interactive Prototyping", "Design Systems", "User Flow", "Information Architecture"],
        },
        {
          id: "ui-skills-2",
          categoryName: "Research & Strategy",
          skills: ["Usability Testing", "User Interviews", "Competitive Benchmarking", "Heuristic Evaluation", "Design Thinking"],
        },
        {
          id: "ui-skills-3",
          categoryName: "Technical Implementation",
          skills: ["HTML5", "CSS3 / Tailwind", "Responsive Layouts", "Accessibility (WCAG)", "Developer Handoff"],
        },
      ],
      achievements: initialAchievements.map((a) => `${a.title} - ${a.issuer || ""}`),
      fontFamily: "Inter",
      fontSize: "md",
      spacingDensity: "normal",
      accentColor: "#09090b",
      showDividers: true,
    },
  ];

  // State management
  const [profiles, setProfiles] = useState<CvProfileData[]>(() => {
    if (initialCvProfilesData) {
      try {
        const parsed = JSON.parse(initialCvProfilesData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse initialCvProfilesData", e);
      }
    }
    return createDefaultProfiles();
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => profiles[0]?.id || "preset-webdev");
  const [activeFormSection, setActiveFormSection] = useState<
    "header" | "summary" | "experience" | "projects" | "skills" | "education" | "achievements" | "styles"
  >("header");

  const [scale, setScale] = useState<number>(0.85);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Update specific field in current active profile
  const updateActiveProfile = (updates: Partial<CvProfileData>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfileId ? { ...p, ...updates } : p))
    );
  };

  // Add new profile preset
  const handleCreateNewPreset = () => {
    const name = prompt("Enter Name for the New Preset Profile:", "New Profile");
    if (!name) return;

    const newId = `preset-${Date.now()}`;
    const newProfile: CvProfileData = {
      ...activeProfile,
      id: newId,
      profileName: name,
    };

    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newId);
  };

  // Duplicate current profile preset
  const handleDuplicatePreset = () => {
    const newId = `preset-${Date.now()}`;
    const newProfile: CvProfileData = {
      ...activeProfile,
      id: newId,
      profileName: `${activeProfile.profileName} (Copy)`,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newId);
  };

  // Delete profile preset
  const handleDeletePreset = () => {
    if (profiles.length <= 1) {
      alert("You must keep at least one CV profile preset.");
      return;
    }
    if (!confirm(`Are you sure you want to delete profile preset "${activeProfile.profileName}"?`)) return;

    const nextProfiles = profiles.filter((p) => p.id !== activeProfileId);
    setProfiles(nextProfiles);
    setActiveProfileId(nextProfiles[0].id);
  };

  // Save all profiles to Database
  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      if (onSaveSetting) {
        await onSaveSetting("cv_profiles_data", JSON.stringify(profiles));
      } else {
        const res = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "cv_profiles_data",
            value: JSON.stringify(profiles),
          }),
        });
        if (!res.ok) throw new Error("Failed to save settings");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save CV profiles to database.");
    } finally {
      setSaving(false);
    }
  };

  // Sync projects and skills from database into current profile
  const handleSyncFromDatabase = () => {
    if (!confirm("This will refresh project and skill list from your current portfolio database. Proceed?")) return;

    // Merge projects
    const existingProjectIds = new Set(activeProfile.projects.map((p) => p.projectId));
    const newProjects: CvProjectItem[] = [...activeProfile.projects];

    initialProjects.forEach((p) => {
      if (!existingProjectIds.has(p.id)) {
        newProjects.push({
          id: `proj-${p.id}`,
          projectId: p.id,
          title: p.title,
          role: "Developer",
          period: new Date(p.createdAt || Date.now()).getFullYear().toString(),
          tools: p.category?.name ? [p.category.name] : ["Web"],
          link: p.demoUrl || p.githubUrl || "",
          bullets: [p.description || "Production project implementation."],
          selected: false,
        });
      }
    });

    updateActiveProfile({
      projects: newProjects,
    });
  };

  // Print / Export PDF Handler using clean dedicated print window/styles
  const handlePrintPDF = () => {
    const printContent = document.getElementById("ats-cv-sheet");
    if (!printContent) return;

    // Create hidden iframe for isolated clean print
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "fixed";
    printIframe.style.right = "0";
    printIframe.style.bottom = "0";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "0";
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (!doc) return;

    // Collect all stylesheet links from current document
    const styleLinks = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((el) => el.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeProfile.fullName} - Resume (${activeProfile.targetRole})</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${styleLinks}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #18181b !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #ats-cv-sheet {
              width: 100% !important;
              min-height: 297mm !important;
              box-shadow: none !important;
              border: none !important;
              transform: none !important;
              margin: 0 !important;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.frameElement.parentNode.removeChild(window.frameElement);
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        updateActiveProfile({ photoUrl: data.url, showPhoto: true });
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          TOP CONTROL BAR: Preset Selector, Save & Print Actions
          ======================================================== */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                CV Profile Preset
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={activeProfileId}
                  onChange={(e) => setActiveProfileId(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.profileName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preset Actions: Rename, Duplicate, New, Delete */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                const newName = prompt("Rename Profile Preset:", activeProfile.profileName);
                if (newName) updateActiveProfile({ profileName: newName });
              }}
              title="Rename preset"
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs flex items-center gap-1 transition"
            >
              Rename
            </button>
            <button
              onClick={handleDuplicatePreset}
              title="Duplicate current preset"
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs flex items-center gap-1 transition"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              onClick={handleCreateNewPreset}
              title="Create brand new preset"
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
            {profiles.length > 1 && (
              <button
                onClick={handleDeletePreset}
                title="Delete preset"
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Save & Print Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleSyncFromDatabase}
            title="Sync latest projects and skills from database"
            className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync DB
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Presets"}
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Export / Print PDF
          </button>
        </div>
      </div>

      {/* ========================================================
          MAIN SPLIT VIEW: Form Editor (Left) & A4 Live Preview (Right)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==========================================
            LEFT COLUMN (5 Cols): Modular Form Editor
            ========================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Navigation Pill Tabs */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "header", label: "Header & Info", icon: User },
              { id: "summary", label: "Summary", icon: FileText },
              { id: "experience", label: "Experience", icon: Briefcase },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "skills", label: "Skills", icon: Wrench },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "achievements", label: "Awards", icon: Award },
              { id: "styles", label: "Styles", icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFormSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormSection(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition ${
                    isActive
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content Body Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
            {/* 1. HEADER & CONTACT SECTION */}
            {activeFormSection === "header" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" /> Header & Personal Contacts
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Nama lengkap, kontak, sosial media, dan pengaturan foto profil di CV.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
                    <input
                      type="text"
                      value={activeProfile.fullName}
                      onChange={(e) => updateActiveProfile({ fullName: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Wardan Nugraha Ahmad"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Target Role / Title</label>
                    <input
                      type="text"
                      value={activeProfile.targetRole}
                      onChange={(e) => updateActiveProfile({ targetRole: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="UI/UX Designer & Product Interface Specialist"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
                    <input
                      type="email"
                      value={activeProfile.email}
                      onChange={(e) => updateActiveProfile({ email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="email@domain.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone</label>
                    <input
                      type="text"
                      value={activeProfile.phone}
                      onChange={(e) => updateActiveProfile({ phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="+62 812-3456-7890"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Location</label>
                    <input
                      type="text"
                      value={activeProfile.location}
                      onChange={(e) => updateActiveProfile({ location: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Bandung, Indonesia"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Portfolio Website</label>
                    <input
                      type="text"
                      value={activeProfile.websiteUrl}
                      onChange={(e) => updateActiveProfile({ websiteUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="https://wardannugraha.my.id"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">LinkedIn URL</label>
                    <input
                      type="text"
                      value={activeProfile.linkedinUrl}
                      onChange={(e) => updateActiveProfile({ linkedinUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">GitHub URL</label>
                    <input
                      type="text"
                      value={activeProfile.githubUrl}
                      onChange={(e) => updateActiveProfile({ githubUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                {/* Photo Toggle & Upload */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-500" /> Tampilkan Foto Profil
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Standar ATS internasional biasanya menonaktifkan foto, sedangkan format Indonesia/Kreatif bisa diaktifkan.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeProfile.showPhoto}
                        onChange={(e) => updateActiveProfile({ showPhoto: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {activeProfile.showPhoto && (
                    <div className="mt-3 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {activeProfile.photoUrl ? (
                        <img
                          src={activeProfile.photoUrl}
                          alt="CV Photo"
                          className="w-12 h-14 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                        />
                      ) : (
                        <div className="w-12 h-14 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center text-zinc-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={activeProfile.photoUrl}
                          onChange={(e) => updateActiveProfile({ photoUrl: e.target.value })}
                          placeholder="Photo URL atau Upload File..."
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                        />
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded text-[11px] font-medium cursor-pointer transition">
                          <Upload className="w-3 h-3" />
                          {uploadingPhoto ? "Uploading..." : "Upload Foto Baru"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. SUMMARY SECTION */}
            {activeFormSection === "summary" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" /> Professional Summary
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Ringkasan karir singkat 2–4 kalimat yang menonjolkan keahlian inti dan pencapaian Anda.
                  </p>
                </div>

                <textarea
                  rows={6}
                  value={activeProfile.summary}
                  onChange={(e) => updateActiveProfile({ summary: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Tuliskan summary profesional Anda..."
                />

                {/* Quick Templates / Prompt Suggestions */}
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Template Saran Cepat:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() =>
                        updateActiveProfile({
                          summary:
                            "Detail-oriented Fullstack Developer with strong expertise in Next.js, TypeScript, and modern database architectures. Experienced in translating complex business requirements into fast, scalable, and responsive web applications.",
                        })
                      }
                      className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700 hover:border-purple-400 rounded text-[11px] text-zinc-800 dark:text-zinc-200 text-left transition"
                    >
                      💻 Fullstack Web Dev Template
                    </button>
                    <button
                      onClick={() =>
                        updateActiveProfile({
                          summary:
                            "User-centric UI/UX Designer dedicated to bridging user research, wireframing, and interactive design systems into intuitive digital products. Proven track record of improving usability metrics and team developer handoff efficiency.",
                        })
                      }
                      className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700 hover:border-purple-400 rounded text-[11px] text-zinc-800 dark:text-zinc-200 text-left transition"
                    >
                      🎨 UI/UX Designer Template
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. WORK EXPERIENCE SECTION */}
            {activeFormSection === "experience" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-500" /> Professional Experience
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Pengalaman kerja, magang, atau kepemimpinan proyek.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newExp: CvExperience = {
                        id: `exp-${Date.now()}`,
                        role: "New Role",
                        company: "Company Name",
                        location: "City, Country",
                        startDate: "2023",
                        endDate: "Present",
                        isCurrent: true,
                        bullets: ["Describe quantifiable achievement with action verb (e.g., Developed, Reduced, Improved)."],
                      };
                      updateActiveProfile({ experiences: [...activeProfile.experiences, newExp] });
                    }}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Job
                  </button>
                </div>

                <div className="space-y-4">
                  {activeProfile.experiences.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Job #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            updateActiveProfile({
                              experiences: activeProfile.experiences.filter((e) => e.id !== exp.id),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Role / Title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...activeProfile.experiences];
                              updated[idx].role = e.target.value;
                              updateActiveProfile({ experiences: updated });
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...activeProfile.experiences];
                              updated[idx].company = e.target.value;
                              updateActiveProfile({ experiences: updated });
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = [...activeProfile.experiences];
                              updated[idx].startDate = e.target.value;
                              updateActiveProfile({ experiences: updated });
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">End Date</label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => {
                              const updated = [...activeProfile.experiences];
                              updated[idx].endDate = e.target.value;
                              updateActiveProfile({ experiences: updated });
                            }}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                          />
                        </div>
                      </div>

                      {/* Bullet points */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            Bullet Points (STAR Format / Key Responsibilities):
                          </label>
                          <button
                            onClick={() => {
                              const updated = [...activeProfile.experiences];
                              updated[idx].bullets.push("");
                              updateActiveProfile({ experiences: updated });
                            }}
                            className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> Add Bullet
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {exp.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-1.5">
                              <span className="text-zinc-400 text-xs">•</span>
                              <input
                                type="text"
                                value={b}
                                onChange={(e) => {
                                  const updated = [...activeProfile.experiences];
                                  updated[idx].bullets[bIdx] = e.target.value;
                                  updateActiveProfile({ experiences: updated });
                                }}
                                className="flex-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                                placeholder="Describe action and impact..."
                              />
                              <button
                                onClick={() => {
                                  const updated = [...activeProfile.experiences];
                                  updated[idx].bullets = updated[idx].bullets.filter((_, i) => i !== bIdx);
                                  updateActiveProfile({ experiences: updated });
                                }}
                                className="text-zinc-400 hover:text-rose-500 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FEATURED PROJECTS SECTION (Cherry-Picking & Override) */}
            {activeFormSection === "projects" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-purple-500" /> Featured Projects (Cherry-Pick)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Pilih proyek mana yang ingin dimasukkan ke CV dan sesuaikan teksnya khusus untuk preset ini.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newProj: CvProjectItem = {
                        id: `proj-custom-${Date.now()}`,
                        title: "Custom Project Name",
                        role: "Designer / Developer",
                        period: "2024",
                        tools: ["Next.js", "Figma"],
                        bullets: ["Engineered responsive digital solution."],
                        selected: true,
                      };
                      updateActiveProfile({ projects: [...activeProfile.projects, newProj] });
                    }}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                <div className="space-y-3">
                  {activeProfile.projects.map((proj, pIdx) => (
                    <div
                      key={proj.id}
                      className={`p-3 rounded-lg border transition ${
                        proj.selected
                          ? "bg-purple-500/5 border-purple-300 dark:border-purple-800/80"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 opacity-60"
                      }`}
                    >
                      {/* Selection Checkbox & Title */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={proj.selected}
                            onChange={(e) => {
                              const updated = [...activeProfile.projects];
                              updated[pIdx].selected = e.target.checked;
                              updateActiveProfile({ projects: updated });
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {proj.title}
                          </span>
                        </label>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium">
                          {proj.selected ? "Included in CV" : "Hidden"}
                        </span>
                      </div>

                      {/* Details (Shown when selected or editable) */}
                      {proj.selected && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-zinc-500">Title / Project Name</label>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => {
                                  const updated = [...activeProfile.projects];
                                  updated[pIdx].title = e.target.value;
                                  updateActiveProfile({ projects: updated });
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-zinc-500">Your Role</label>
                              <input
                                type="text"
                                value={proj.role || ""}
                                onChange={(e) => {
                                  const updated = [...activeProfile.projects];
                                  updated[pIdx].role = e.target.value;
                                  updateActiveProfile({ projects: updated });
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                                placeholder="e.g. Lead Designer"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-zinc-500">Tools / Tech Stack (comma separated)</label>
                              <input
                                type="text"
                                value={proj.tools.join(", ")}
                                onChange={(e) => {
                                  const updated = [...activeProfile.projects];
                                  updated[pIdx].tools = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                  updateActiveProfile({ projects: updated });
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                                placeholder="Figma, Next.js, Tailwind"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-zinc-500">Live / GitHub Link</label>
                              <input
                                type="text"
                                value={proj.link || ""}
                                onChange={(e) => {
                                  const updated = [...activeProfile.projects];
                                  updated[pIdx].link = e.target.value;
                                  updateActiveProfile({ projects: updated });
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          {/* Bullets */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold text-zinc-500">Description Bullets:</label>
                              <button
                                onClick={() => {
                                  const updated = [...activeProfile.projects];
                                  updated[pIdx].bullets.push("");
                                  updateActiveProfile({ projects: updated });
                                }}
                                className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Bullet
                              </button>
                            </div>
                            {proj.bullets.map((b, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-1.5 mt-1">
                                <span className="text-zinc-400 text-xs">•</span>
                                <input
                                  type="text"
                                  value={b}
                                  onChange={(e) => {
                                    const updated = [...activeProfile.projects];
                                    updated[pIdx].bullets[bIdx] = e.target.value;
                                    updateActiveProfile({ projects: updated });
                                  }}
                                  className="flex-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                                />
                                <button
                                  onClick={() => {
                                    const updated = [...activeProfile.projects];
                                    updated[pIdx].bullets = updated[pIdx].bullets.filter((_, i) => i !== bIdx);
                                    updateActiveProfile({ projects: updated });
                                  }}
                                  className="text-zinc-400 hover:text-rose-500 p-0.5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SKILLS SECTION */}
            {activeFormSection === "skills" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-purple-500" /> Technical & Core Skills
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Kelompokkan skill ke dalam kategori yang rapi (misal: Design, Frontend, Tools).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newGroup: CvSkillGroup = {
                        id: `group-${Date.now()}`,
                        categoryName: "New Category",
                        skills: ["Skill 1", "Skill 2"],
                      };
                      updateActiveProfile({ skillGroups: [...activeProfile.skillGroups, newGroup] });
                    }}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>

                <div className="space-y-3">
                  {activeProfile.skillGroups.map((group, gIdx) => (
                    <div
                      key={group.id}
                      className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={group.categoryName}
                          onChange={(e) => {
                            const updated = [...activeProfile.skillGroups];
                            updated[gIdx].categoryName = e.target.value;
                            updateActiveProfile({ skillGroups: updated });
                          }}
                          className="font-bold text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100"
                          placeholder="Category Name"
                        />
                        <button
                          onClick={() => {
                            updateActiveProfile({
                              skillGroups: activeProfile.skillGroups.filter((_, i) => i !== gIdx),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500">Skills (comma separated):</label>
                        <input
                          type="text"
                          value={group.skills.join(", ")}
                          onChange={(e) => {
                            const updated = [...activeProfile.skillGroups];
                            updated[gIdx].skills = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            updateActiveProfile({ skillGroups: updated });
                          }}
                          className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                          placeholder="Figma, Wireframing, User Testing..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. EDUCATION SECTION */}
            {activeFormSection === "education" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-500" /> Education
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Riwayat pendidikan formal, universitas, atau program studi.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newEdu: CvEducation = {
                        id: `edu-${Date.now()}`,
                        school: "Universitas / Institute",
                        degree: "Bachelor Degree",
                        fieldOfStudy: "Computer Science",
                        startDate: "2020",
                        endDate: "2024",
                      };
                      updateActiveProfile({ education: [...activeProfile.education, newEdu] });
                    }}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Education
                  </button>
                </div>

                <div className="space-y-3">
                  {activeProfile.education.map((edu, eIdx) => (
                    <div
                      key={edu.id}
                      className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Education #{eIdx + 1}
                        </span>
                        <button
                          onClick={() => {
                            updateActiveProfile({
                              education: activeProfile.education.filter((_, i) => i !== eIdx),
                            });
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500">School / Institution</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => {
                              const updated = [...activeProfile.education];
                              updated[eIdx].school = e.target.value;
                              updateActiveProfile({ education: updated });
                            }}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500">Degree & Major</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...activeProfile.education];
                              updated[eIdx].degree = e.target.value;
                              updateActiveProfile({ education: updated });
                            }}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500">Period (e.g. 2020 – 2024)</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={edu.startDate}
                              onChange={(e) => {
                                const updated = [...activeProfile.education];
                                updated[eIdx].startDate = e.target.value;
                                updateActiveProfile({ education: updated });
                              }}
                              className="w-1/2 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                              placeholder="Start"
                            />
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => {
                                const updated = [...activeProfile.education];
                                updated[eIdx].endDate = e.target.value;
                                updateActiveProfile({ education: updated });
                              }}
                              className="w-1/2 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                              placeholder="End"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500">GPA / Honors (Optional)</label>
                          <input
                            type="text"
                            value={edu.gpa || ""}
                            onChange={(e) => {
                              const updated = [...activeProfile.education];
                              updated[eIdx].gpa = e.target.value;
                              updateActiveProfile({ education: updated });
                            }}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                            placeholder="e.g. 3.85 / 4.00"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. ACHIEVEMENTS SECTION */}
            {activeFormSection === "achievements" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-500" /> Achievements & Certifications
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Penghargaan lomba, sertifikasi profesional, atau lisensi keahlian.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      updateActiveProfile({ achievements: [...activeProfile.achievements, ""] });
                    }}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Award
                  </button>
                </div>

                <div className="space-y-2">
                  {activeProfile.achievements.map((ach, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2">
                      <span className="text-zinc-400 text-xs">•</span>
                      <input
                        type="text"
                        value={ach}
                        onChange={(e) => {
                          const updated = [...activeProfile.achievements];
                          updated[aIdx] = e.target.value;
                          updateActiveProfile({ achievements: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                        placeholder="e.g. 1st Place National UI/UX Design Hackathon (2024)"
                      />
                      <button
                        onClick={() => {
                          updateActiveProfile({
                            achievements: activeProfile.achievements.filter((_, i) => i !== aIdx),
                          });
                        }}
                        className="text-zinc-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. STYLES & LAYOUT SECTION */}
            {activeFormSection === "styles" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-500" /> Typography & A4 Density Settings
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Atur jenis font ATS standar dan kerapatan spasi agar pas dalam 1 halaman A4.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">ATS Font Family</label>
                    <select
                      value={activeProfile.fontFamily}
                      onChange={(e) => updateActiveProfile({ fontFamily: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="Inter">Inter (Clean Modern Sans - Recommended)</option>
                      <option value="Geist">Geist (Modern Tech Sans)</option>
                      <option value="Arial">Arial (Standard Universal Sans)</option>
                      <option value="Times New Roman">Times New Roman (Traditional Serif)</option>
                      <option value="Calibri">Calibri (Corporate Sans)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Spacing Density</label>
                    <select
                      value={activeProfile.spacingDensity}
                      onChange={(e) => updateActiveProfile({ spacingDensity: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="compact">Compact (Muat banyak konten dalam 1 halaman)</option>
                      <option value="normal">Normal (Seimbang & Elegan)</option>
                      <option value="spacious">Spacious (Longgar untuk konten singkat)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-900 dark:text-blue-200">
                  💡 <strong>Tips Lolos ATS:</strong> Gunakan font standar seperti <em>Inter</em> atau <em>Arial</em>, serta pilih kepadatan <em>Compact</em> atau <em>Normal</em> agar seluruh riwayat krusial Anda pas termuat dalam 1 lembar A4 tanpa terpotong.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN (7 Cols): Live A4 Document Preview
            ========================================== */}
        <div className="lg:col-span-7 space-y-3">
          {/* Preview Toolbar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-500" /> Live A4 Sheet Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ATS 100% Vector Text
              </span>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 px-1 min-w-[36px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(1.2, s + 0.1))}
                className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setScale(0.85)}
                className="px-1.5 py-0.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-[10px] font-semibold text-zinc-600 dark:text-zinc-400"
                title="Fit Screen"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Scrollable A4 Document Viewport */}
          <div className="bg-zinc-200 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800/80 rounded-xl p-4 md:p-6 overflow-x-auto min-h-[600px] flex justify-center items-start shadow-inner">
            <div
              style={{
                width: "210mm",
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                marginBottom: `${(scale - 1) * 297 * 3.78}px`,
              }}
            >
              <CvA4Document data={activeProfile} scale={1} isPrinting={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
