"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Clock, Mail } from "lucide-react";

const services = [
  { name: "API (api.curacareplatform.co.uk)", status: "operational" },
  { name: "Dashboard (app.curacareplatform.co.uk)", status: "operational" },
  { name: "Authentication", status: "operational" },
  { name: "Database", status: "operational" },
  { name: "File Storage", status: "operational" },
  { name: "AI Services", status: "operational" },
  { name: "Email Notifications", status: "operational" },
  { name: "Mobile App", status: "operational" },
];

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    const t = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#a78bfa" }}>System Status</p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <CheckCircle size={20} style={{ color: "#10b981" }} />
              <span className="text-lg font-bold" style={{ color: "#10b981" }}>All Systems Operational</span>
            </div>
            {lastUpdated && (
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
                <Clock size={12} /> Last updated {lastUpdated}
              </p>
            )}
          </div>

          {/* Uptime stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: "99.97%", label: "Uptime (90 days)" },
              { value: "0", label: "Incidents (30 days)" },
              { value: "142ms", label: "Avg response time" },
            ].map(({ value, label }) => (
              <div key={label} className="glass rounded-2xl p-5 text-center" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Service list */}
          <div className="glass rounded-2xl overflow-hidden mb-10" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="text-white font-semibold">Service Status</h2>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {services.map(({ name }) => (
                <div key={name} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm text-gray-300">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: "#10b981" }} />
                    <span className="text-xs font-medium" style={{ color: "#10b981" }}>Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uptime bar visual */}
          <div className="glass rounded-2xl p-6 mb-10" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">90-day uptime</h3>
              <span className="text-xs text-gray-500">99.97%</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 90 }).map((_, i) => (
                <div key={i} className="flex-1 h-8 rounded-sm" style={{ background: i === 47 || i === 48 ? "rgba(251,191,36,0.6)" : "rgba(16,185,129,0.7)" }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Past incidents */}
          <div className="glass rounded-2xl p-6 mb-10" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-white font-semibold mb-4">Recent incidents</h3>
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle size={28} className="mb-3" style={{ color: "#10b981" }} />
              <p className="text-gray-400 text-sm">No incidents reported in the last 90 days.</p>
            </div>
          </div>

          {/* Subscribe */}
          <div className="text-center glass rounded-2xl p-8" style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
            <Mail size={24} className="mx-auto mb-3" style={{ color: "#a78bfa" }} />
            <h3 className="text-white font-semibold mb-2">Subscribe to status updates</h3>
            <p className="text-gray-400 text-sm mb-5">Get notified immediately of any incidents or maintenance windows.</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
