import { prisma } from "./prisma";
import { v2 as cloudinary } from "cloudinary";

/**
 * Extracts the Cloudinary public_id (including folder path) from a secure CDN URL.
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    
    let path = parts[1];
    // Remove Cloudinary versioning segment if present (e.g. v171928372/)
    if (path.startsWith("v")) {
      const firstSlash = path.indexOf("/");
      if (firstSlash !== -1) {
        path = path.substring(firstSlash + 1);
      }
    }
    
    // Remove file extension
    const dotIndex = path.lastIndexOf(".");
    if (dotIndex !== -1) {
      path = path.substring(0, dotIndex);
    }
    
    return path;
  } catch (error) {
    console.error("Failed to parse Cloudinary URL:", error);
    return null;
  }
}

/**
 * Verify if the given image URL is referenced by any other records in the database.
 * Optional excludeId parameter ensures it does not check the record being updated.
 */
export async function isImageReferencedElsewhere(url: string, excludeId?: string): Promise<boolean> {
  if (!url) return false;
  try {
    // 1. Check Project covers
    const projectCount = await prisma.project.count({
      where: {
        featuredImage: url,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (projectCount > 0) return true;

    // 2. Check Achievement certifications
    const achievementCount = await prisma.achievement.count({
      where: {
        image: url,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (achievementCount > 0) return true;

    // 3. Check Community activity photos
    const communityCount = await prisma.communityActivity.count({
      where: {
        image: url,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (communityCount > 0) return true;

    // 4. Check Media urls (supports cover photo segments like videoUrl||coverUrl)
    const mediaCount = await prisma.media.count({
      where: {
        OR: [
          { url: url },
          { url: { contains: url } }
        ],
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (mediaCount > 0) return true;

    return false;
  } catch (error) {
    console.error("Reference check failed, assuming referenced as fail-safe:", error);
    return true;
  }
}

/**
 * Delete an asset from Cloudinary by its secure CDN URL.
 * Safely prevents deletion if the URL is referenced elsewhere in the database.
 */
export async function deleteCloudinaryImage(url: string, excludeId?: string): Promise<boolean> {
  try {
    const cloudinaryUrlEnv = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrlEnv) return false;

    // 1. Confirm asset is not used by other database items
    const referenced = await isImageReferencedElsewhere(url, excludeId);
    if (referenced) {
      console.log(`Cloudinary asset is still in use, skipping delete: ${url}`);
      return false;
    }

    // 2. Parse public ID
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    // 3. Request asset destruction from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary asset "${publicId}" destruction result:`, result);
    return result.result === "ok";
  } catch (error) {
    console.error("Failed to delete Cloudinary asset:", error);
    return false;
  }
}
