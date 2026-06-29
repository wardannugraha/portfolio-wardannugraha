import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    const activities = await prisma.communityActivity.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error("GET Community API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, role, organization, dateRange, description, image, content, links } = await request.json();

    if (!title || !role || !organization || !dateRange) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let activity;
    if (id) {
      // Check if image changed, and delete the old one if it is no longer used
      const oldComm = await prisma.communityActivity.findUnique({
        where: { id },
        select: { image: true }
      });
      if (oldComm && oldComm.image && oldComm.image !== image) {
        await deleteCloudinaryImage(oldComm.image, id);
      }

      activity = await prisma.communityActivity.update({
        where: { id },
        data: {
          title,
          role,
          organization,
          dateRange,
          description: description || null,
          image: image || null,
          content: content || null,
          links: links || null,
        },
      });
    } else {
      activity = await prisma.communityActivity.create({
        data: {
          title,
          role,
          organization,
          dateRange,
          description: description || null,
          image: image || null,
          content: content || null,
          links: links || null,
        },
      });
    }

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error("POST Community API Error:", error);
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
    const oldComm = await prisma.communityActivity.findUnique({
      where: { id },
      select: { image: true }
    });
    if (oldComm && oldComm.image) {
      await deleteCloudinaryImage(oldComm.image, id);
    }

    await prisma.communityActivity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    console.error("DELETE Community API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
