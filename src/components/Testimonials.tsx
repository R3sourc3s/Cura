"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sandra Powell",
    role: "Registered Manager",
    home: "Meadowbrook Care, Manchester",
    avatar: "SP",
    color: "#7c3aed",
    rating: 5,
    quote:
      "Cura has transformed how we operate. Our last CQC inspection was Outstanding — the inspector was genuinely impressed by how our audit trails were organised. I can't imagine going back.",
  },
  {
    name: "James Okafor",
    role: "Director of Care",
    home: "Sunrise Group, 12 Homes",
    avatar: "JO",
    color: "#3b82f6",
    rating: 5,
    quote:
      "Rolling out Cura across all 12 of our homes was the best decision we've made. The AI care planning alone has saved our managers hours every week. The ROI was evident within 3 months.",
  },
  {
    name: "Priya Khatri",
    role: "Head of Nursing",
    home: "Pineview Nursing Home, Leicester",
    avatar: "PK",
    color: "#06b6d4",
    rating: 5,
    quote:
      "The medication management module is outstanding. We've had zero medication errors since implementing Cura — that's the number that matters most to me and my team.",
  },
  {
    name: "Tom Hargreaves",
    role: "HR & Operations Manager",
    home: "Elderflower Group, Birmingham",
    avatar: "TH",
    color: "#10b981",
    rating: 5,
    quote:
      "Rota building used to take half my week. Now it takes 20 minutes. The skill-matching and auto gap-fill have been a game changer, especially during winter when agency use is highest.",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.06), transparent)",
        }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>
            Trusted By Care Leaders
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-white">
            Hear from the homes already thriving
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-10 lg:p-14 relative mb-8"
            style={{ border: `1px solid ${t.color}33` }}
          >
            <Quote
              size={40}
              className="absolute top-8 left-8 opacity-20"
              style={{ color: t.color }}
            />

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <blockquote className="text-xl lg:text-2xl text-white font-medium leading-relaxed mb-8 relative z-10">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
              >
                {t.avatar}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">{t.name}</div>
                <div className="text-gray-400 text-sm">{t.role}</div>
                <div className="text-gray-500 text-xs">{t.home}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "6px",
                  background: i === current ? "#7c3aed" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
