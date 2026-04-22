"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ToastProvider } from "@/components/Toast";
import { UserProvider } from "@/context/UserContext";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <UserProvider>
      <ToastProvider>
        <div className="flex min-h-screen" style={{ background: "#050914" }}>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </UserProvider>
  );
}
