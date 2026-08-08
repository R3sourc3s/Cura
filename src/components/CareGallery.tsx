"use client";

import { motion } from "framer-motion";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1762955913084-96ea3f986468?w=800&h=1000&fit=crop&crop=center&auto=format&q=80",
    alt: "Young carer doing crafts with elderly residents",
    caption: "Activities that bring joy every day",
    tag: "Person-centred care",
    span: "row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1773227059780-5e865ce7fb13?w=800&h=500&fit=crop&crop=center&auto=format&q=80",
    alt: "Residents and carer laughing together in a group activity",
    caption: "Connection and community, every shift",
    tag: "Resident wellbeing",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1773227060703-b31bd307e218?w=800&h=500&fit=crop&crop=center&auto=format&q=80",
    alt: "Elderly women enjoying an activity session together",
    caption: "Dignity at the centre of everything",
    tag: "Meaningful activity",
    span: "",
  },
];

export default function CareGallery() {
  return (
    <section className="py-24" style={{ background: "var(--bg-card)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="lp-serif text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Built for the people who matter most
          </h2>
          <p className="max-w-xl mx-auto text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Good care runs on trust, routine, and having the right information at the right moment.
            Cura makes that possible for every resident, every shift.
          </p>
        </motion.div>

        {/* Photo grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{ gridTemplateRows: "auto auto" }}
        >
          {photos.map((photo, i) => (
            <motion.div
              key={photo.alt}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative rounded-2xl overflow-hidden group ${photo.span}`}
              style={{
                height: i === 0 ? "100%" : "220px",
                minHeight: "220px",
                border: "1px solid var(--border)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(15,23,42,0.75) 0%, transparent 60%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full mb-2 inline-block"
                  style={{
                    background: "rgba(13, 148, 136,0.35)",
                    border: "1px solid rgba(13, 148, 136,0.5)",
                    color: "#a8e6b8",
                  }}
                >
                  {photo.tag}
                </span>
                <p className="text-white text-sm font-medium leading-snug">{photo.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
