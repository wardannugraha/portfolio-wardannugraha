import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    console.error("GET Media API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, url, description, categoryId, isFeatured } = await request.json();

    if (!title || !url) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let media;
    if (id) {
      // Check if URL changed, and delete the old assets if they are no longer used
      const oldMedia = await prisma.media.findUnique({
        where: { id },
        select: { url: true }
      });
      if (oldMedia && oldMedia.url && oldMedia.url !== url) {
        const oldUrls = oldMedia.url.split("||");
        const newUrls = url.split("||");
        for (const oUrl of oldUrls) {
          if (oUrl && !newUrls.includes(oUrl)) {
            await deleteCloudinaryImage(oUrl, id);
          }
        }
      }

      media = await prisma.media.update({
        where: { id },
        data: {
          title,
          url,
          description,
          categoryId: categoryId || null,
          isFeatured: !!isFeatured,
        },
      });
    } else {
      media = await prisma.media.create({
        data: {
          title,
          url,
          description,
          categoryId: categoryId || null,
          isFeatured: !!isFeatured,
        },
      });
    }

    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    console.error("POST Media API Error:", error);
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

    // Fetch first to get cover and asset URLs
    const oldMedia = await prisma.media.findUnique({
      where: { id },
      select: { url: true }
    });
    if (oldMedia && oldMedia.url) {
      const oldUrls = oldMedia.url.split("||");
      for (const oUrl of oldUrls) {
        if (oUrl) {
          await deleteCloudinaryImage(oUrl, id);
        }
      }
    }

    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Media item deleted successfully" });
  } catch (error) {
    console.error("DELETE Media API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
