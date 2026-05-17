import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Note: If your file is still named Nav.tsx, change the path below to "@/components/Nav"
import Navbar from "@/components/Nav"; 

// Initialize the clean, modern font for our light UI
const inter = Inter({ subsets: ["latin"] });

// Next.js 14 Metadata API (replaces manual <head> tags)
export const metadata: Metadata = {
  title: "INFLUUR — Influencer Intelligence Platform",
  description: "Premium influencer discovery, analytics, and CRM for modern brands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {/* Global Navigation */}
        <Navbar />
        
        {/* Main Content Wrapper */}
        <main className="min-h-[calc(100vh-64px)] flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}