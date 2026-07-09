import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CivilTech | Engineering Workflow Platform",
  description:
    "Modern civil engineering project workflow management platform with role-based dashboards, pipeline tracking, and real-time status monitoring.",
  keywords: ["civil engineering", "workflow", "project management", "pipeline"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased selection:bg-blue-500/30`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
