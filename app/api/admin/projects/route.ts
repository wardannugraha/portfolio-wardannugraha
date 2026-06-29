import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("GET Projects API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, description, content, featuredImage, demoUrl, githubUrl, links, categoryId, isFeatured } = await request.json();

    if (!title || !description || !categoryId || !featuredImage) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let project;
    if (id) {
      // Check if image changed, and delete the old one if it is no longer used
      const oldProject = await prisma.project.findUnique({
        where: { id },
        select: { featuredImage: true }
      });
      if (oldProject && oldProject.featuredImage && oldProject.featuredImage !== featuredImage) {
        await deleteCloudinaryImage(oldProject.featuredImage, id);
      }

      project = await prisma.project.update({
        where: { id },
        data: {
          title,
          description,
          content,
          featuredImage,
          demoUrl,
          githubUrl,
          links,
          categoryId,
          isFeatured: !!isFeatured,
        },
      });
    } else {
      project = await prisma.project.create({
        data: {
          title,
          description,
          content,
          featuredImage,
          demoUrl,
          githubUrl,
          links,
          categoryId,
          isFeatured: !!isFeatured,
        },
      });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("POST Project API Error:", error);
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

    // Fetch first to get cover image URL
    const oldProject = await prisma.project.findUnique({
      where: { id },
      select: { featuredImage: true }
    });
    if (oldProject && oldProject.featuredImage) {
      await deleteCloudinaryImage(oldProject.featuredImage, id);
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("DELETE Project API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
