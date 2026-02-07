import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",               // Homepage
    "/home(.*)",       // Home page
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/api/auth(.*)",   // Legacy auth endpoints
    "/schedule(.*)",
    "/patrons(.*)",
    "/gallery(.*)",
    "/sponsors(.*)",
    "/contacts(.*)",
    "/events(.*)",
    "/team(.*)",
    "/about(.*)",
    "/login(.*)",
    "/register(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    const url = new URL(req.url);

    // Always allow the root path
    if (url.pathname === "/") {
        return;
    }

    // Allow public routes
    if (isPublicRoute(req)) {
        return;
    }

    // Protect all other routes
    await auth.protect();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
