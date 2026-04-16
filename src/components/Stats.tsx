"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 1200, suffix: "+", label: "Care Homes", desc: "Trust Empathika daily" },
  { value: 98, suffix: "%", label: "Compliance Rate", desc: "Across all registered homes" },
  { value: 4, suffix: "hrs", label: "Saved Per Day", desc: "Per care manager on average" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", desc: "Enterprise-grade reliability" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="text-5xl lg:text-6xl font-extrabold text-white">
      {Number.isInteger(value) ? Math.round(count) : count.toFixed(1)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: "rgba(124, 58, 237, 0.05)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.05), transparent)",
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>
            By The Numbers
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-white">
            Results that speak for themselves
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass glass-hover rounded-2xl p-8 text-center"
            >
              <Counter value={stat.value} suffix={stat.suffix} />
              <div className="text-lg font-semibold text-white mt-2 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
