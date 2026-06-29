import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  
  // Clear the cookie by setting maxAge to 0
  response.cookies.set({
    name: "admin_session",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
