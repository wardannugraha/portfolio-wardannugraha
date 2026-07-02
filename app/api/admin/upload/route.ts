import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifySession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Helper to determine the target folder structure in Cloudinary
function getCloudinaryFolder(target: string | null): string {
  const rootFolder = "portfolio-wardan";
  switch (target) {
    case "project":
      return `${rootFolder}/projects`;
    case "about":
      return `${rootFolder}/profile`;
    case "content":
      return `${rootFolder}/content`;
    case "achContent":
    case "achievement":
      return `${rootFolder}/achievements`;
    case "commContent":
    case "community":
      return `${rootFolder}/community`;
    case "mediaCover":
    case "media":
      return `${rootFolder}/media`;
    default:
      return `${rootFolder}/general`;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify admin session
    if (!(await verifySession())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");

    // 3. Check if Cloudinary is configured
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl) {
      // Convert file into a Buffer and encode as a Base64 data URI
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type;
      const base64Data = buffer.toString("base64");
      const fileUri = `data:${mimeType};base64,${base64Data}`;

      // Upload to Cloudinary with folder organization and optimization
      const folderPath = getCloudinaryFolder(target);
      const cleanTarget = target || "general";
      const publicId = `${cleanTarget}_${Date.now()}`;

      const result = await cloudinary.uploader.upload(fileUri, {
        folder: folderPath,
        public_id: publicId,
        overwrite: true,
        resource_type: "auto",
        transformation: [
          { width: 1600, height: 1600, crop: "limit" },
          { quality: "auto" }
        ]
      });

      return NextResponse.json({
        success: true,
        message: "File uploaded successfully to Cloudinary",
        url: result.secure_url,
      });
    }

    // 4. Local storage fallback if Cloudinary is not configured
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure local uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Write file to local disk
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully to local storage (fallback)",
      url: `/uploads/${uniqueFileName}`,
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
