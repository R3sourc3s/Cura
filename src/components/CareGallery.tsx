"use client";

import { motion } from "framer-motion";
import { Heart, Shield, Clock, Users } from "lucide-react";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1762955913084-96ea3f986468?w=800&h=1000&fit=crop&crop=center&auto=format&q=80",
    alt: "Young carer in blue uniform doing crafts with two elderly women residents",
    caption: "Activities that bring joy every day",
    tag: "Every resident",
    tagColor: "#7c3aed",
    span: "row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1773227059780-5e865ce7fb13?w=800&h=500&fit=crop&crop=center&auto=format&q=80",
    alt: "Residents and carer laughing together during a group activity session in a care home",
    caption: "Connection and community, every shift",
    tag: "Every day",
    tagColor: "#3b82f6",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1773227060703-b31bd307e218?w=800&h=500&fit=crop&crop=center&auto=format&q=80",
    alt: "Elderly women residents enjoying an activity session together in a care home lounge",
    caption: "Dignity and wellbeing at the centre",
    tag: "Every handover",
    tagColor: "#10b981",
    span: "",
  },
];

const highlights = [
  { icon: Heart, value: "500+", label: "Care Homes Served", color: "#f472b6" },
  { icon: Users, value: "12,000+", label: "Care Professionals", color: "#7c3aed" },
  { icon: Shield, value: "Outstanding", label: "CQC Rating Goal", color: "#3b82f6" },
  { icon: Clock, value: "4 hrs/week", label: "Admin Time Saved Per Manager", color: "#10b981" },
];

export default function CareGallery() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 50%, rgba(124,58,237,0.07), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>
            Where Technology Meets Compassion
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Built for the people who matter most
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
            Great care homes run on trust, routine, and the right information at
            the right moment. Cura makes that possible for every resident, every
            shift.
          </p>
        </motion.div>

        {/* Photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16" style={{ gridTemplateRows: "auto auto" }}>
          {photos.map((photo, i) => (
            <motion.div
              key={photo.alt}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative rounded-2xl overflow-hidden group ${photo.span}`}
              style={{
                height: i === 0 ? "100%" : "220px",
                minHeight: "220px",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(to top, rgba(5,9,20,0.85) 0%, rgba(5,9,20,0.2) 60%, transparent 100%)",
                }}
              />
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full mb-2 inline-block"
                  style={{
                    background: `${photo.tagColor}25`,
                    border: `1px solid ${photo.tagColor}55`,
                    color: photo.tagColor,
                  }}
                >
                  {photo.tag}
                </span>
                <p className="text-white text-sm font-medium leading-snug">{photo.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlight stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {highlights.map((h) => (
            <div
              key={h.label}
              className="glass rounded-2xl p-6 flex items-center gap-4"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${h.color}20` }}
              >
                <h.icon size={20} style={{ color: h.color }} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white">{h.value}</div>
                <div className="text-gray-500 text-xs leading-tight">{h.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
