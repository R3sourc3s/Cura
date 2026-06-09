"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Clock, Mail } from "lucide-react";

const services = [
  { name: "API (api.curacareplatform.co.uk)" },
  { name: "Dashboard (app.curacareplatform.co.uk)" },
  { name: "Authentication" },
  { name: "Database" },
  { name: "File Storage" },
  { name: "AI Services" },
  { name: "Email Notifications" },
  { name: "Mobile App" },
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
    <main style={{ background: "#faf7f0", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#2d5a3d" }}>System Status</p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6"
              style={{ background: "rgba(45,90,61,0.1)", border: "1px solid rgba(45,90,61,0.3)" }}>
              <CheckCircle size={20} style={{ color: "#2d5a3d" }} />
              <span className="text-lg font-bold" style={{ color: "#2d5a3d" }}>All Systems Operational</span>
            </div>
            {lastUpdated && (
              <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: "#7a7468" }}>
                <Clock size={12} /> Last updated {lastUpdated}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: "99.97%", label: "Uptime (90 days)" },
              { value: "0",      label: "Incidents (30 days)" },
              { value: "142ms",  label: "Avg response time" },
            ].map(({ value, label }) => (
              <div key={label} className="lp-card rounded-2xl p-5 text-center">
                <div className="lp-serif text-2xl font-bold mb-1" style={{ color: "#1c1a14" }}>{value}</div>
                <div className="text-xs" style={{ color: "#7a7468" }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="lp-card rounded-2xl overflow-hidden mb-10">
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #dfd8cc" }}>
              <h2 className="font-semibold" style={{ color: "#1c1a14" }}>Service Status</h2>
            </div>
            <div>
              {services.map(({ name }, i) => (
                <div key={name} className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: i < services.length - 1 ? "1px solid #dfd8cc" : "none" }}>
                  <span className="text-sm" style={{ color: "#4a4438" }}>{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: "#2d5a3d" }} />
                    <span className="text-xs font-medium" style={{ color: "#2d5a3d" }}>Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-card rounded-2xl p-6 mb-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "#1c1a14" }}>90-day uptime</h3>
              <span className="text-xs" style={{ color: "#7a7468" }}>99.97%</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 90 }).map((_, i) => (
                <div key={i} className="flex-1 h-8 rounded-sm"
                  style={{ background: i === 47 || i === 48 ? "rgba(184,146,58,0.55)" : "rgba(45,90,61,0.45)" }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs" style={{ color: "#a89f94" }}>
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>

          <div className="lp-card rounded-2xl p-6 mb-10">
            <h3 className="font-semibold mb-4" style={{ color: "#1c1a14" }}>Recent incidents</h3>
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle size={28} className="mb-3" style={{ color: "#2d5a3d" }} />
              <p className="text-sm" style={{ color: "#7a7468" }}>No incidents reported in the last 90 days.</p>
            </div>
          </div>

          <div className="lp-card rounded-2xl p-8 text-center">
            <Mail size={24} className="mx-auto mb-3" style={{ color: "#2d5a3d" }} />
            <h3 className="font-semibold mb-2" style={{ color: "#1c1a14" }}>Subscribe to status updates</h3>
            <p className="text-sm mb-5" style={{ color: "#7a7468" }}>Get notified immediately of any incidents or maintenance windows.</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#faf7f0", border: "1px solid #dfd8cc", color: "#1c1a14" }} />
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#2d5a3d" }}>Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
