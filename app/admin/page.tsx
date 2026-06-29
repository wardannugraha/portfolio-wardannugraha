import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await verifySession())) {
    redirect("/admin/login");
  }

  // Fetch initial data from database on the server
  let projects: any[] = [];
  let media: any[] = [];
  let categories: any[] = [];
  let skills: any[] = [];
  let achievements: any[] = [];
  let communityActivities: any[] = [];
  let aboutMeSetting: any = null;
  let aboutNameSetting: any = null;
  let aboutPhotoSetting: any = null;
  let skillCategoriesSetting: any = null;
  let contactLinksSetting: any = null;

  try {
    categories = await prisma.category.findMany();
    
    projects = await prisma.project.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    media = await prisma.media.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    skills = await prisma.skill.findMany({
      orderBy: { createdAt: "desc" },
    });

    achievements = await prisma.achievement.findMany({
      orderBy: { date: "desc" },
    });

    communityActivities = await prisma.communityActivity.findMany({
      orderBy: { createdAt: "desc" },
    });

    aboutMeSetting = await prisma.siteSetting.findUnique({
      where: { key: "about_me" },
    });

    aboutNameSetting = await prisma.siteSetting.findUnique({
      where: { key: "about_name" },
    });

    aboutPhotoSetting = await prisma.siteSetting.findUnique({
      where: { key: "about_photo" },
    });

    skillCategoriesSetting = await prisma.siteSetting.findUnique({
      where: { key: "skill_categories" },
    });

    contactLinksSetting = await prisma.siteSetting.findUnique({
      where: { key: "contact_links" },
    });
  } catch (error) {
    console.error("Error fetching admin data from database:", error);
  }

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
    />
  );
}

