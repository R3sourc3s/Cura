import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cura — UK's #1 Care Home Management Platform",
  description: "One platform. Every function. Total clarity. AI-powered care home management for medication, staffing, compliance, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
