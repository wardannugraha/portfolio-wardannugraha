import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifySession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { isImageReferencedElsewhere, getPublicIdFromUrl } from "@/lib/cloudinary";

export async function GET(request: Request) {
  try {
    // 1. Verify admin session
    if (!(await verifySession())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");
    const nextCursor = searchParams.get("nextCursor") || undefined;
    const offset = parseInt(searchParams.get("offset") || "0");

    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    // A. CLOUDINARY FLOW (If configured)
    if (cloudinaryUrl) {
      const folderRoot = "portfolio-wardan";
      
      const result = await cloudinary.search
        .expression(`folder:${folderRoot}/*`)
        .sort_by("created_at", "desc")
        .max_results(limit)
        .next_cursor(nextCursor)
        .execute();

      // Check status of inUse for each asset
      const assets = await Promise.all(
        result.resources.map(async (r: any) => {
          const url = r.secure_url;
          const inUse = await isImageReferencedElsewhere(url);
          return { url, inUse };
        })
      );
      
      return NextResponse.json({
        success: true,
        assets,
        nextCursor: result.next_cursor || null,
        hasMore: !!result.next_cursor,
        mode: "cloudinary"
      });
    }

    // B. LOCAL STORAGE FLOW (Fallback)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    let files: string[] = [];
    try {
      files = await fs.readdir(uploadDir);
    } catch (e) {
      // Directory doesn't exist yet
    }

    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stat = await fs.stat(filePath);
        return {
          url: `/uploads/${filename}`,
          mtime: stat.mtimeMs,
        };
      })
    );

    // Sort by modified time descending (newest first)
    fileStats.sort((a, b) => b.mtime - a.mtime);

    const paginatedFiles = fileStats.slice(offset, offset + limit).map(f => f.url);
    const hasMore = offset + limit < fileStats.length;

    // Check status of inUse for each local asset
    const assets = await Promise.all(
      paginatedFiles.map(async (url) => {
        const inUse = await isImageReferencedElsewhere(url);
        return { url, inUse };
      })
    );

    return NextResponse.json({
      success: true,
      assets,
      nextOffset: hasMore ? offset + limit : null,
      hasMore,
      mode: "local"
    });

  } catch (error) {
    console.error("GET Assets API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load assets" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Verify admin session
    if (!(await verifySession())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ success: false, error: "Missing url parameter" }, { status: 400 });
    }

    // 2. Prevent deletion if image is referenced in database (covers or markdown texts)
    const referenced = await isImageReferencedElsewhere(url);
    if (referenced) {
      return NextResponse.json({ 
        success: false, 
        error: "Gambar tidak dapat dihapus karena masih digunakan sebagai cover atau di dalam teks artikel konten aktif." 
      }, { status: 400 });
    }

    // 3. Delete from Cloudinary
    const cloudinaryUrlEnv = process.env.CLOUDINARY_URL;
    if (cloudinaryUrlEnv && url.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === "ok") {
          return NextResponse.json({ success: true, message: "Asset deleted from Cloudinary" });
        }
      }
      return NextResponse.json({ success: false, error: "Failed to delete asset from Cloudinary" }, { status: 500 });
    }

    // 4. Delete from Local Storage (fallback)
    if (url.startsWith("/uploads/")) {
      const filename = url.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      try {
        await fs.unlink(filePath);
        return NextResponse.json({ success: true, message: "Asset deleted from local storage" });
      } catch (e) {
        return NextResponse.json({ success: false, error: "File not found locally" }, { status: 404 });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid asset URL" }, { status: 400 });

  } catch (error) {
    console.error("DELETE Assets API Error:", error);
    return NextResponse.json({ success: false, error: "Server error during asset deletion" }, { status: 500 });
  }
}
