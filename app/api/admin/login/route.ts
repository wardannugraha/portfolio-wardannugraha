import { NextResponse } from "next/server";
import { generateSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsernames = (process.env.ADMIN_USERNAME || "admin").split(",").map(u => u.trim());
    const expectedPasswords = (process.env.ADMIN_PASSWORD || "password").split(",").map(p => p.trim());

    const userIndex = expectedUsernames.indexOf(username);
    const hasValidPassword = userIndex !== -1 && userIndex < expectedPasswords.length && password === expectedPasswords[userIndex];

    if (hasValidPassword) {
      // Create response and set cookie
      const response = NextResponse.json({ success: true, message: "Logged in successfully" });
      
      response.cookies.set({
        name: "admin_session",
        value: generateSessionToken(),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
