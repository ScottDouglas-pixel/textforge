import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TranscriptToPost – Turn Any Text Into Blogs & Podcasts Instantly",
  description:
    "Transform raw notes, ideas, or topics into polished SEO blog posts and podcast scripts using AI. No writing skills needed.",
  keywords:
    "text to blog, text to podcast, AI blog writer, AI podcast script, content generator, SEO blog generator",
  openGraph: {
    title: "TranscriptToPost – AI Content Transformer",
    description: "Turn any text into SEO blogs and podcast scripts instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-forge-bg text-forge-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
