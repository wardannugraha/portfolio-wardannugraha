import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: achievements });
  } catch (error) {
    console.error("GET Achievements API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, issuer, date, description, image, content, links } = await request.json();

    if (!title || !issuer) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const parsedDate = date ? new Date(date) : null;

    let achievement;
    if (id) {
      // Check if image changed, and delete the old one if it is no longer used
      const oldAch = await prisma.achievement.findUnique({
        where: { id },
        select: { image: true }
      });
      if (oldAch && oldAch.image && oldAch.image !== image) {
        await deleteCloudinaryImage(oldAch.image, id);
      }

      achievement = await prisma.achievement.update({
        where: { id },
        data: {
          title,
          issuer,
          date: parsedDate,
          description: description || null,
          image: image || null,
          content: content || null,
          links: links || null,
        },
      });
    } else {
      achievement = await prisma.achievement.create({
        data: {
          title,
          issuer,
          date: parsedDate,
          description: description || null,
          image: image || null,
          content: content || null,
          links: links || null,
        },
      });
    }

    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    console.error("POST Achievement API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID parameter" }, { status: 400 });
    }

    // Fetch first to get image URL
    const oldAch = await prisma.achievement.findUnique({
      where: { id },
      select: { image: true }
    });
    if (oldAch && oldAch.image) {
      await deleteCloudinaryImage(oldAch.image, id);
    }

    await prisma.achievement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Achievement deleted successfully" });
  } catch (error) {
    console.error("DELETE Achievement API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
