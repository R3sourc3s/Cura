"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Pill,
  ClipboardList,
  UserCheck,
  FileText,
  Bot,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Residents", href: "/dashboard/residents", icon: Users },
  { name: "Medications", href: "/dashboard/medications", icon: Pill },
  { name: "Care Plans", href: "/dashboard/care-plans", icon: ClipboardList },
  { name: "Staff", href: "/dashboard/staff", icon: UserCheck },
  { name: "Compliance", href: "/dashboard/compliance", icon: FileText },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { name: "Settings", href: "/dashboard/settings", icon: Settings }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-16 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700 border-r-2 border-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
