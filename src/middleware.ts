import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // -----------------------------------------------------------
  // 1. LISTE DES PAGES D'AUTHENTIFICATION
  // (Si on est connecté, on ne doit PAS pouvoir y accéder)
  // -----------------------------------------------------------
  const authRoutes = ["/signin", "/signup", "/forgot-password"];
  
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthPage && token) {
    // Si connecté, on renvoie vers le dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // -----------------------------------------------------------
  // 2. LISTE DES PAGES PROTÉGÉES
  // (Si on n'est PAS connecté, on doit être redirigé vers le login)
  // -----------------------------------------------------------
  const protectedRoutes = [
    "/dashboard",
    "/account",
    "/finances",
    "/notifications",
    "/root-dashboard",
    "/settings",
    "/tickets",
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Si pas connecté, on renvoie vers le login
    const signInUrl = new URL("/signin", req.url);
    // On garde en mémoire où il voulait aller pour le rediriger après
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
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