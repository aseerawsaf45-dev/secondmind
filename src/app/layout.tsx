import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#040408",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://secondmind-aa.vercel.app'),
  title: "SecondMind — Your AI-Powered Memory",
  description: "Save anything. Remember everything. Let AI do the organizing.",
  keywords: ["second brain", "knowledge management", "AI", "notes", "bookmarks"],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "SecondMind — Your AI-Powered Memory",
    description: "Save anything. Remember everything. Let AI do the organizing.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SecondMind AI Memory Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecondMind — Your AI-Powered Memory",
    description: "Save anything. Remember everything. Let AI do the organizing.",
    images: ["/og-image.png"],
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
      <html lang="en" className={`${inter.variable} ${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#040408] text-white relative">
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
