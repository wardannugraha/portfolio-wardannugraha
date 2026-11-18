import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function fetchAdminData() {
  return await Promise.all([
    prisma.category.findMany(),
    prisma.project.findMany({
      include: { category: true },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    }),
    prisma.media.findMany({
      include: { category: true },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    }),
    prisma.skill.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    }),
    prisma.achievement.findMany({
      orderBy: [
        { order: "asc" },
        { date: "desc" }
      ],
    }),
    prisma.communityActivity.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    }),
    prisma.siteSetting.findUnique({
      where: { key: "about_me" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "about_name" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "about_photo" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "skill_categories" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "contact_links" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "cv_profiles_data" },
    }),
  ]);
}

export default async function AdminDashboard() {
  if (!(await verifySession())) {
    redirect("/admin/login");
  }

  let results: any = null;

  try {
    results = await fetchAdminData();
  } catch (initialErr) {
    console.warn("Initial admin DB fetch failed (Neon database cold-starting), retrying in 1.5s...", initialErr);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      results = await fetchAdminData();
    } catch (retryErr) {
      console.error("Error fetching admin data from database after retry:", retryErr);
    }
  }

  const [
    categories = [],
    projects = [],
    media = [],
    skills = [],
    achievements = [],
    communityActivities = [],
    aboutMeSetting = null,
    aboutNameSetting = null,
    aboutPhotoSetting = null,
    skillCategoriesSetting = null,
    contactLinksSetting = null,
    cvProfilesSetting = null,
  ] = results || [];

  return (
    <AdminDashboardClient
      initialProjects={projects}
      initialMedia={media}
      categories={categories}
      initialSkills={skills}
      initialAchievements={achievements}
      initialCommunity={communityActivities}
      initialAboutMe={aboutMeSetting?.value || ""}
      initialAboutName={aboutNameSetting?.value || ""}
      initialAboutPhoto={aboutPhotoSetting?.value || ""}
      initialSkillCategories={skillCategoriesSetting?.value || "[]"}
      initialContactLinks={contactLinksSetting?.value || "[]"}
      initialCvProfilesData={cvProfilesSetting?.value || ""}
    />
  );
}
