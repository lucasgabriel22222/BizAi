import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production-min-32-chars"
);

const publicPaths = ["/", "/login", "/register", "/forgot-password", "/auth/callback", "/checkout/success", "/checkout/failure", "/checkout/pending"];
const authPaths = ["/login", "/register", "/forgot-password"];

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/agendar/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("clinica_session")?.value;
  const isAuthenticated = token ? await verifyToken(token) : false;

  const isPublicBooking = pathname.startsWith("/agendar");
  const isAuthPage = authPaths.some((p) => pathname === p);
  const isPublic = publicPaths.includes(pathname) || isPublicBooking;

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
