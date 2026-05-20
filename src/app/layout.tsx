import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Note: If your file is still named Nav.tsx, change the path below to "@/components/Nav"
import Navbar from "@/components/Nav"; 

// Initialize the clean, modern font for our UI
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
      {/* UPDATED: Deep black background, white text, and hidden overflow so blobs don't cause scrolling */}
      <body className={`${inter.className} bg-black text-white min-h-screen relative overflow-x-hidden antialiased`}>
        
        {/* --- NEW: The Codex WebGL Illusion Background --- */}
        {/* This stays fixed at the back of every single page */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          {/* Top Left Blue Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[120px] animate-blob"></div>
          
          {/* Bottom Right Purple Glow (Delayed so they don't sync up) */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[120px] animate-blob" style={{ animationDelay: '5s' }}></div>
          
          {/* Center Cyan Glow */}
          <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[140px] animate-blob" style={{ animationDelay: '10s' }}></div>
        </div>

        {/* Global Navigation */}
        <Navbar />
        
        {/* Main Content Wrapper */}
        {/* Ensure content sits above the background blobs */}
        <main className="min-h-[calc(100vh-64px)] flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}