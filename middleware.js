import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Edge-runtime session check (jose). Pages re-check the session server-side too.
async function verify(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("school_session")?.value;
  const session = token ? await verify(token) : null;

  const need = pathname.startsWith("/admin") ? ["superadmin", "admin"]
    : pathname.startsWith("/teacher") ? ["teacher"]
    : pathname.startsWith("/student") ? ["student"] : null;

  if (need && (!session || !need.includes(session.role))) {
    const type = pathname.startsWith("/student") ? "student" : "staff";
    return NextResponse.redirect(new URL(`/login?type=${type}`, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"] };
