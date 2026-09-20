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

    const validItems = items.filter((item) => item && typeof item.id === "string");

    // Execute individual updates in parallel without transaction locks
    await Promise.all(
      validItems.map(async (item) => {
        const orderVal = typeof item.order === "number" ? Math.round(item.order) : (item.order ? parseInt(String(item.order), 10) : 0);
        const data = { order: isNaN(orderVal) ? 0 : orderVal };

        try {
          if (type === "projects") {
            await prisma.project.update({ where: { id: item.id }, data });
          } else if (type === "media") {
            await prisma.media.update({ where: { id: item.id }, data });
          } else if (type === "achievements") {
            await prisma.achievement.update({ where: { id: item.id }, data });
          } else if (type === "skills") {
            await prisma.skill.update({ where: { id: item.id }, data });
          } else if (type === "community") {
            await prisma.communityActivity.update({ where: { id: item.id }, data });
          }
        } catch (itemErr: any) {
          console.warn(`[reorder] item update failed for ${item.id} in ${type}:`, itemErr?.message);
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reorder API error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Database error" }, { status: 500 });
  }
}
