"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";

interface User {
  id: number;
  username: string;
  role: string;
  full_name: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your care home today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Residents"
          value="24"
          change="+2 this week"
          icon="users"
        />
        <StatCard
          title="Active Care Plans"
          value="18"
          change="+1 this week"
          icon="clipboard"
        />
        <StatCard
          title="Medications Due"
          value="12"
          change="Next 2 hours"
          icon="pill"
        />
        <StatCard
          title="Compliance Rate"
          value="98%"
          change="+2% this month"
          icon="check-circle"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Medication administered to John Smith
              </p>
              <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Care plan review completed for Mary Johnson
              </p>
              <span className="text-xs text-gray-400 ml-auto">15 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Low stock alert: Paracetamol
              </p>
              <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <div className="text-purple-600 font-medium">Add Resident</div>
              <div className="text-sm text-purple-500">
                Register new resident
              </div>
            </button>
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <div className="text-blue-600 font-medium">Log Medication</div>
              <div className="text-sm text-blue-500">Record administration</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <div className="text-green-600 font-medium">Update Care Plan</div>
              <div className="text-sm text-green-500">Modify resident care</div>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <div className="text-orange-600 font-medium">
                Compliance Check
              </div>
              <div className="text-sm text-orange-500">Run safety audit</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
