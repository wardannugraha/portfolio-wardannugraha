import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, items } = await request.json(); // type: 'projects' | 'media' | 'achievements' | 'skills' | 'community', items: { id: string, order: number }[]

    if (!type || !items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const updates = items.map((item) => {
      const data = { order: item.order };
      if (type === "projects") {
        return prisma.project.update({ where: { id: item.id }, data });
      } else if (type === "media") {
        return prisma.media.update({ where: { id: item.id }, data });
      } else if (type === "achievements") {
        return prisma.achievement.update({ where: { id: item.id }, data });
      } else if (type === "skills") {
        return prisma.skill.update({ where: { id: item.id }, data });
      } else if (type === "community") {
        return prisma.communityActivity.update({ where: { id: item.id }, data });
      }
      throw new Error("Unknown type: " + type);
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reorder error:", error);
    return NextResponse.json({ success: false, error: error.message || "Database error" }, { status: 500 });
  }
}
