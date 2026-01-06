// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  console.log(`Middleware checking: ${pathname}, Has token: ${!!token}`);

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    console.log("Admin route detected, checking auth...");

    if (!token) {
      console.log('No token, redirecting to login');
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }

    if (token.role !== "admin") {
      console.log("User is not admin, redirecting");
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log("Admin access granted");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
