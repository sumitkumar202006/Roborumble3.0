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
            <title>ROBO RUMBLE 3.0 | The Ultimate Robotics Competition at CSJMU</title>
            <meta name="description" content="Robo Rumble 3.0 is CSJMU's biggest annual robotics fest — Robo Wars, RC Flying, Line Following, Esports, Innovation and more. Register now and compete for ₹1,50,000+ in prizes!" />
            <meta name="keywords" content="Robo Rumble, Robo Rumble 3.0, CSJMU robotics, robotics competition, robot wars, esports, Kanpur robotics fest, CSJMU fest, college robotics event, RC flying, line follower robot" />
            <meta name="author" content="Robo Rumble Tech Team, CSJMU" />
            <meta name="robots" content="index, follow" />
            <meta name="theme-color" content="#00F0FF" />
            <link rel="canonical" href="https://roborumble.in" />

            {/* Google Search Console Verification */}
            <meta name="google-site-verification" content="m69ccbUxk2aLzOhKlMZrZW3WGcvcrYutXi8Y4Fsbx4E" />

            {/* Open Graph (Facebook / WhatsApp / LinkedIn) */}
            <meta property="og:title" content="ROBO RUMBLE 3.0 | The Ultimate Robotics Competition" />
            <meta property="og:description" content="CSJMU's biggest robotics fest is back! Compete in Robo Wars, RC Flying, Esports, Innovation & more. Prize pool ₹1,50,000+. Register now!" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://roborumble.in" />
            <meta property="og:image" content="https://roborumble.in/og-image.png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="Robo Rumble 3.0" />
            <meta property="og:locale" content="en_IN" />

            {/* Twitter / X Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="ROBO RUMBLE 3.0 | The Ultimate Robotics Competition" />
            <meta name="twitter:description" content="Compete in Robo Wars, RC Flying, Esports & more at CSJMU. Prize pool ₹1,50,000+. Register now!" />
            <meta name="twitter:image" content="https://roborumble.in/og-image.png" />

            <link rel="icon" href="/skull.png" />
            <link rel="apple-touch-icon" href="/skull.png" />
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
