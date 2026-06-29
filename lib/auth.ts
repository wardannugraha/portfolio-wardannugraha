import { cookies } from "next/headers";
import crypto from "crypto";

const AUTH_COOKIE_NAME = "admin_session";
// Ensure there is a strong fallback secret for signing the sessions
const SECRET = process.env.ADMIN_SESSION_SECRET || "fallback_super_secret_key_portfolio_wardannugraha_7788";

/**
 * Generate a cryptographically signed session token:
 * "expirationTimestamp:signature"
 */
export function generateSessionToken(maxAgeInSeconds: number = 60 * 60 * 24): string {
  const expiresAt = Date.now() + maxAgeInSeconds * 1000;
  
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(String(expiresAt))
    .digest("hex");
    
  return `${expiresAt}:${signature}`;
}

/**
 * Verify if the current session cookie exists, has not expired,
 * and matches the computed cryptographic signature.
 */
export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE_NAME);
    if (!session || !session.value) return false;

    const parts = session.value.split(":");
    if (parts.length !== 2) return false;

    const [expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    // Check expiration timestamp
    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return false;
    }

    // Recompute HMAC to verify signature integrity
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(expiresAtStr)
      .digest("hex");

    // Secure timing-safe equality check to block timing attacks
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    console.error("Session verification failed:", error);
    return false;
  }
}
