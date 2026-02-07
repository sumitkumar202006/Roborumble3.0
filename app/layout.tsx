"use client";

import { usePathname } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import ParticleBackground from "./components/ParticleBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isIntroPage = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");
  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");

  // Hide navbar on admin, dashboard, and onboarding pages
  const showNavbar = !isIntroPage && !isAdminPage && !isDashboard && !isOnboarding;

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>ROBO RUMBLE | The Ultimate Robotics Showdown</title>
          <meta name="description" content="Join Robo Rumble 3.0 at CSJMU. The Ultimate Robotics Competition." />
          <link rel="icon" href="/skull-1.png" />
        </head>
        <body>
          {!isDashboard && <ParticleBackground />}
          <AuthProvider>
            {showNavbar && <Navbar />}
            {children}
            <CustomCursor />
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

