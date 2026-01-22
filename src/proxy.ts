import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const dashboardPrefix = "/admin";
  const commonDashboardRoute = "/admin/dashboard";

  const superAdminRoutes = [
    "/admin/users",
    "/admin/root-dashboard",
    "/admin/settings/global",
  ];

  const authRoutes = ["/signin", "/signup", "/forgot-password"];

  const isDashboardRoute = pathname.startsWith(dashboardPrefix);
  const isSuperAdminRoute = superAdminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // public routes
  if (!isDashboardRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuthenticated = !!token && !!token.id;

  // not authenticated
  if (isDashboardRoute && !isAuthenticated) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // authenticated on auth route
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(commonDashboardRoute, req.url));
  }

  // not super admin
  if (isSuperAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL(commonDashboardRoute, req.url));
  }

  return NextResponse.next();
}

// -----------------------------------------------------------
// CONFIGURATION DU MATCHER
// On exclut les fichiers statiques (_next, images, api) pour ne pas ralentir le site
// -----------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match tous les chemins sauf ceux commençant par :
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icône du site)
     * - images (tes images publiques)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};

