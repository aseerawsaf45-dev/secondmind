import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SecondMind — Your AI-Powered Memory",
  description: "Save anything. Remember everything. Let AI do the organizing.",
  keywords: ["second brain", "knowledge management", "AI", "notes", "bookmarks"],
  openGraph: {
    title: "SecondMind — Your AI-Powered Memory",
    description: "Save anything. Remember everything. Let AI do the organizing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
