"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPalette from "./CommandPalette";
import QuickCareNote from "./QuickCareNote";
import { ToastProvider } from "@/components/Toast";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <UserProvider>
        <ToastProvider>
          <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
              <Header onMenuClick={() => setSidebarOpen(true)} />
              <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
            </div>
            <CommandPalette />
            <QuickCareNote />
          </div>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
