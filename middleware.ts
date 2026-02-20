import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Define public routes that don't require authentication
const publicRoutes = [
    "/",               // Homepage
    "/home",
    "/sign-in",
    "/sign-up",
    "/schedule",
    "/patrons",
    "/gallery",
    "/sponsors",
    "/contacts",
    "/events",
    "/team",
    "/about",
    "/login",
    "/register",
    "/admin/login",
];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isPublicRoute = publicRoutes.some(route => 
        nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
    ) || nextUrl.pathname.startsWith("/api/auth") 
      || nextUrl.pathname.startsWith("/api/webhooks")
      || nextUrl.pathname.startsWith("/api/uploadthing");

    if (isPublicRoute) {
        return NextResponse.next();
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
