"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPalette from "./CommandPalette";
import QuickCareNote from "./QuickCareNote";
import { ToastProvider } from "@/components/Toast";
import { UserProvider } from "@/context/UserContext";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <UserProvider>
      <ToastProvider>
        <div className="dashboard-scope flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main id="main-content" tabIndex={-1} className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
          </div>
          <CommandPalette />
          <QuickCareNote />
        </div>
      </ToastProvider>
    </UserProvider>
  );
}
