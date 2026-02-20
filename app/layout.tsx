"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import ParticleBackground from "./components/ParticleBackground";
import RegistrationGate from "./components/RegistrationGate";

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

  const isLogin = pathname.startsWith("/login");
  const isRegister = pathname.startsWith("/register");

  // Hide navbar on admin, dashboard, onboarding, login, and register pages
  const showNavbar =
    !isIntroPage &&
    !isAdminPage &&
    !isDashboard &&
    !isOnboarding &&
    !isLogin &&
    !isRegister;

  return (
      <SessionProvider>
        <html lang="en">
          <head>
            <title>ROBO RUMBLE | The Ultimate Robotics Showdown</title>
            <meta
              name="description"
              content="Join Robo Rumble 3.0 at CSJMU. The Ultimate Robotics Competition."
            />
            <link rel="icon" href="/skull.png" />
          </head>
          <body>
            {!isDashboard && <ParticleBackground />}
            <AuthProvider>
              <RegistrationGate>
                {showNavbar && <Navbar />}
                {children}
              </RegistrationGate>
              <CustomCursor />
            </AuthProvider>
          </body>
        </html>
      </SessionProvider>
  );
}
