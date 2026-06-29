import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const setting = await prisma.siteSetting.findUnique({
        where: { key },
      });
      return NextResponse.json({ success: true, data: setting });
    }

    const settings = await prisma.siteSetting.findMany();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("GET Settings API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "Missing key or value fields" }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error("POST Settings API Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
