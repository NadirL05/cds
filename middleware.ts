import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes - require FRANCHISE_OWNER or SUPER_ADMIN role
    if (path.startsWith("/admin")) {
      if (token?.role !== "FRANCHISE_OWNER" && token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/member", req.url));
      }
    }

    // Coach routes - require COACH, FRANCHISE_OWNER or SUPER_ADMIN role
    if (path.startsWith("/coach")) {
      if (
        token?.role !== "COACH" &&
        token?.role !== "FRANCHISE_OWNER" &&
        token?.role !== "SUPER_ADMIN"
      ) {
        return NextResponse.redirect(new URL("/member", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/member/:path*", "/coach/:path*", "/admin/:path*"],
};

