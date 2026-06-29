import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error("GET Skills API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, level, category, icon } = await request.json();

    if (!name || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let skill;
    if (id) {
      // Update existing skill
      skill = await prisma.skill.update({
        where: { id },
        data: {
          name,
          level: level ? String(level) : null,
          category,
          icon: icon || null,
        },
      });
    } else {
      // Create new skill
      skill = await prisma.skill.create({
        data: {
          name,
          level: level ? String(level) : null,
          category,
          icon: icon || null,
        },
      });
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("POST Skill API Error:", error);
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

    await prisma.skill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    console.error("DELETE Skill API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
