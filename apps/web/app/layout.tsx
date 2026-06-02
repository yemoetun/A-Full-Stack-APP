import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PWARegister } from "@/components/PWARegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "ProjectFlow", template: "%s | ProjectFlow" },
  description: "Project management for modern teams",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProjectFlow",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-152x152.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ProjectFlow" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
