import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

// Runs before first paint to avoid a theme flash (FOUC).
const themeInit = `(function(){try{var t=localStorage.getItem('cura-theme');if(!t){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

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
    <html lang="en" className={`h-full antialiased ${lora.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
