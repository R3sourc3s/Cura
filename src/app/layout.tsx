import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cura — Care Home Management Software",
  description: "Cura connects medication records, care plans, staff rotas, and compliance tracking in one platform built for UK care homes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${lora.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
