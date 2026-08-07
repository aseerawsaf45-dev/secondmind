import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#08080f",
};

export const metadata: Metadata = {
  title: "SecondMind — Your AI-Powered Memory",
  description: "Save anything. Remember everything. Let AI do the organizing.",
  keywords: ["second brain", "knowledge management", "AI", "notes", "bookmarks"],
  openGraph: {
    title: "SecondMind — Your AI-Powered Memory",
    description: "Save anything. Remember everything. Let AI do the organizing.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SecondMind"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#08080F] text-white relative">
          <div className="gradient-mesh-container">
            <div className="gradient-mesh-orb gradient-mesh-orb-1" />
            <div className="gradient-mesh-orb gradient-mesh-orb-2" />
            <div className="gradient-mesh-orb gradient-mesh-orb-3" />
            <div className="gradient-mesh-orb gradient-mesh-orb-4" />
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
