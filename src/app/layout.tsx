import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadGen Intel — Lead Generation Intelligence Platform",
  description:
    "Discover businesses and professionals in any location. Generate detailed lead reports with AI-powered scoring, contact enrichment, and export capabilities.",
  keywords: [
    "lead generation",
    "business discovery",
    "lead scoring",
    "B2B leads",
    "contact enrichment",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-950 text-surface-100 font-sans">
        {children}
      </body>
    </html>
  );
}
