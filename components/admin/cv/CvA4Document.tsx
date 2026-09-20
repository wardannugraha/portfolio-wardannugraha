"use client";

import React from "react";
import { CvProfileData } from "./types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface CvA4DocumentProps {
  data: CvProfileData;
  scale?: number;
  isPrinting?: boolean;
}

export default function CvA4Document({
  data,
  scale = 1,
  isPrinting = false,
}: CvA4DocumentProps) {
  // Density and font mapping
  const fontClassMap = {
    Inter: "font-sans",
    Geist: "font-sans",
    Arial: "font-sans",
    "Times New Roman": "font-serif",
    Calibri: "font-sans",
  };

  const densitySpacingMap = {
    compact: {
      pagePadding: "p-8",
      sectionGap: "space-y-3",
      itemGap: "space-y-1.5",
      bulletGap: "space-y-0.5",
      textBase: "text-[11px] leading-[1.35]",
      textTitle: "text-xl font-bold tracking-tight",
      textSection: "text-xs font-bold tracking-wider uppercase",
      textItemTitle: "text-xs font-bold",
    },
    normal: {
      pagePadding: "p-9",
      sectionGap: "space-y-4",
      itemGap: "space-y-2",
      bulletGap: "space-y-1",
      textBase: "text-[12px] leading-[1.4]",
      textTitle: "text-2xl font-bold tracking-tight",
      textSection: "text-sm font-bold tracking-wider uppercase",
      textItemTitle: "text-xs font-bold",
    },
    spacious: {
      pagePadding: "p-10",
      sectionGap: "space-y-5",
      itemGap: "space-y-3",
      bulletGap: "space-y-1.5",
      textBase: "text-[13px] leading-[1.45]",
      textTitle: "text-2xl font-bold tracking-tight",
      textSection: "text-sm font-bold tracking-wider uppercase",
      textItemTitle: "text-sm font-bold",
    },
  };

  const currentDensity = densitySpacingMap[data.spacingDensity || "normal"];
  const selectedProjects = data.projects.filter((p) => p.selected);

  return (
    <div
      id="ats-cv-sheet"
      className={`bg-white text-zinc-900 mx-auto shadow-2xl transition-transform origin-top select-text ${
        isPrinting ? "shadow-none border-none m-0 p-0" : "border border-zinc-200 rounded-sm"
      } ${currentDensity.pagePadding} ${fontClassMap[data.fontFamily || "Inter"]}`}
      style={{
        width: isPrinting ? "100%" : "210mm",
        minHeight: isPrinting ? "auto" : "297mm",
        boxSizing: "border-box",
        transform: isPrinting ? "none" : `scale(${scale})`,
        color: "#18181b",
      }}
    >
      {/* ========================================================
          HEADER SECTION (Full Name, Target Role, Contact Links, Photo)
          ======================================================== */}
      <header className="border-b border-zinc-300 pb-3 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className={`${currentDensity.textTitle} text-zinc-950 uppercase tracking-wide`}>
              {data.fullName || "Your Full Name"}
            </h1>
            {data.targetRole && (
              <p className="text-xs font-semibold text-zinc-700 tracking-wide mt-0.5">
                {data.targetRole}
              </p>
            )}

            {/* Contact Details row with clean ATS separators */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600 mt-2">
              {data.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-500 inline" />
                  {data.location}
                </span>
              )}
              {data.email && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-zinc-300">•</span>
                  <Mail className="w-3 h-3 text-zinc-500 inline" />
                  <a href={`mailto:${data.email}`} className="hover:underline text-zinc-800">
                    {data.email}
                  </a>
                </span>
              )}
              {data.phone && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-zinc-300">•</span>
                  <Phone className="w-3 h-3 text-zinc-500 inline" />
                  <span>{data.phone}</span>
                </span>
              )}
              {data.websiteUrl && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-zinc-300">•</span>
                  <Globe className="w-3 h-3 text-zinc-500 inline" />
                  <a
                    href={data.websiteUrl.startsWith("http") ? data.websiteUrl : `https://${data.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-zinc-800"
                  >
                    {data.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                </span>
              )}
              {data.linkedinUrl && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-zinc-300">•</span>
                  <LinkedinIcon className="w-3 h-3 text-zinc-500 inline" />
                  <a
                    href={data.linkedinUrl.startsWith("http") ? data.linkedinUrl : `https://${data.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-zinc-800"
                  >
                    {data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/")}
                  </a>
                </span>
              )}
              {data.githubUrl && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-zinc-300">•</span>
                  <GithubIcon className="w-3 h-3 text-zinc-500 inline" />
                  <a
                    href={data.githubUrl.startsWith("http") ? data.githubUrl : `https://${data.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-zinc-800"
                  >
                    {data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")}
                  </a>
                </span>
              )}
            </div>
          </div>

          {/* Optional Profile Photo */}
          {data.showPhoto && data.photoUrl && (
            <div className="flex-shrink-0">
              <img
                src={data.photoUrl}
                alt={data.fullName || "Profile"}
                className="w-20 h-24 object-cover rounded border border-zinc-300 shadow-sm"
              />
            </div>
          )}
        </div>
      </header>

      {/* ========================================================
          BODY SECTIONS (Linear, standard semantic ATS hierarchy)
          ======================================================== */}
      <main className={currentDensity.sectionGap}>
        {/* 1. PROFESSIONAL SUMMARY */}
        {data.summary && data.summary.trim() !== "" && (
          <section>
            <h2 className={`${currentDensity.textSection} text-zinc-900 border-b border-zinc-200 pb-0.5 mb-1.5`}>
              Professional Summary
            </h2>
            <p className={`${currentDensity.textBase} text-zinc-800 text-justify`}>
              {data.summary}
            </p>
          </section>
        )}

        {/* 2. WORK / PROFESSIONAL EXPERIENCE */}
        {data.experiences && data.experiences.length > 0 && (
          <section>
            <h2 className={`${currentDensity.textSection} text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2`}>
              Professional Experience
            </h2>
            <div className={currentDensity.itemGap}>
              {data.experiences.map((exp) => (
                <div key={exp.id} className="text-zinc-900">
                  <div className="flex justify-between items-baseline gap-2">
                    <div>
                      <span className={`${currentDensity.textItemTitle} text-zinc-900`}>{exp.role}</span>
                      <span className="text-zinc-700 text-[11px] font-medium ml-1.5">
                        | {exp.company}
                        {exp.location ? `, ${exp.location}` : ""}
                      </span>
                    </div>
                    <span className="text-[10.5px] font-medium text-zinc-600 whitespace-nowrap">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                    </span>
                  </div>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className={`list-disc list-outside ml-4 mt-1 ${currentDensity.bulletGap} ${currentDensity.textBase} text-zinc-800`}>
                      {exp.bullets
                        .filter((b) => b && b.trim() !== "")
                        .map((bullet, idx) => (
                          <li key={idx} className="pl-0.5">
                            {bullet}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. FEATURED PROJECTS / CASE STUDIES */}
        {selectedProjects && selectedProjects.length > 0 && (
          <section>
            <h2 className={`${currentDensity.textSection} text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2`}>
              Featured Projects & Portfolio
            </h2>
            <div className={currentDensity.itemGap}>
              {selectedProjects.map((proj) => (
                <div key={proj.id} className="text-zinc-900">
                  <div className="flex justify-between items-baseline gap-2">
                    <div>
                      <span className={`${currentDensity.textItemTitle} text-zinc-900`}>{proj.title}</span>
                      {proj.role && (
                        <span className="text-zinc-700 text-[11px] font-medium ml-1.5">
                          | {proj.role}
                        </span>
                      )}
                      {proj.tools && proj.tools.length > 0 && (
                        <span className="text-[10.5px] text-zinc-600 ml-1.5 italic">
                          ({proj.tools.join(", ")})
                        </span>
                      )}
                    </div>
                    {proj.period && (
                      <span className="text-[10.5px] font-medium text-zinc-600 whitespace-nowrap">
                        {proj.period}
                      </span>
                    )}
                  </div>

                  {proj.link && (
                    <div className="text-[10.5px] text-zinc-600">
                      Link:{" "}
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                        {proj.link}
                      </a>
                    </div>
                  )}

                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className={`list-disc list-outside ml-4 mt-1 ${currentDensity.bulletGap} ${currentDensity.textBase} text-zinc-800`}>
                      {proj.bullets
                        .filter((b) => b && b.trim() !== "")
                        .map((bullet, idx) => (
                          <li key={idx} className="pl-0.5">
                            {bullet}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. TECHNICAL & SOFT SKILLS */}
        {data.skillGroups && data.skillGroups.length > 0 && (
          <section>
            <h2 className={`${currentDensity.textSection} text-zinc-900 border-b border-zinc-200 pb-0.5 mb-1.5`}>
              Technical & Core Skills
            </h2>
            <div className={`space-y-1 ${currentDensity.textBase}`}>
              {data.skillGroups.map((group) => (
                <div key={group.id} className="flex flex-wrap items-baseline gap-1 text-zinc-800">
                  <span className="font-semibold text-zinc-950 min-w-[130px]">
                    {group.categoryName}:
                  </span>
                  <span>{group.skills.join(", ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. EDUCATION */}
        {data.education && data.education.length > 0 && (
          <section>
            <h2 className={`${currentDensity.textSection} text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2`}>
              Education
            </h2>
            <div className={currentDensity.itemGap}>
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline gap-2">
                    <div>
                      <span className={`${currentDensity.textItemTitle} text-zinc-900`}>{edu.school}</span>
                      <span className="text-zinc-700 text-[11px] font-medium ml-1.5">
                        – {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                        {edu.location ? ` (${edu.location})` : ""}
                      </span>
                    </div>
                    <span className="text-[10.5px] font-medium text-zinc-600 whitespace-nowrap">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  {edu.gpa && (
                    <div className="text-[11px] text-zinc-700 mt-0.5">
                      GPA / Academic Score: <span className="font-semibold">{edu.gpa}</span>
                    </div>
                  )}
                  {edu.description && (
                    <p className={`${currentDensity.textBase} text-zinc-700 mt-0.5`}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. ACHIEVEMENTS & CERTIFICATIONS */}
        {data.achievements && data.achievements.length > 0 && (
          <section>
            <h2 className={`${currentDensity.textSection} text-zinc-900 border-b border-zinc-200 pb-0.5 mb-1.5`}>
              Achievements & Certifications
            </h2>
            <ul className={`list-disc list-outside ml-4 ${currentDensity.bulletGap} ${currentDensity.textBase} text-zinc-800`}>
              {data.achievements
                .filter((a) => a && a.trim() !== "")
                .map((ach, idx) => (
                  <li key={idx} className="pl-0.5">
                    {ach}
                  </li>
                ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
