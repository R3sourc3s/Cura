"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

export default function CTA() {
  return (
    <section id="demo" className="py-24" style={{ background: "#faf7f0" }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
          style={{ minHeight: "420px" }}
        >
          {/* Background care home photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1773227055624-07b515ba87c5?w=1400&h=700&fit=crop&crop=center&auto=format&q=80"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Forest green overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(28,46,32,0.93) 0%, rgba(45,90,61,0.87) 50%, rgba(22,38,26,0.93) 100%)",
            }}
          />

          <div className="relative text-center px-8 py-20">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-7"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              <Calendar size={13} />
              30-minute personalised walkthrough — no commitment
            </div>

            <h2 className="lp-serif text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
              See it working with your home.
            </h2>

            <p className="text-lg max-w-lg mx-auto mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
              Book a 30-minute walkthrough with our team. We&apos;ll show you how Cura fits around
              your existing setup — no pressure, no jargon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@curacareplatform.co.uk"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-semibold text-base transition-all"
                style={{ background: "white", color: "#2d5a3d" }}
              >
                Request a Free Demo <ArrowRight size={16} />
              </a>
              <a
                href="tel:+441234567890"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-semibold text-white text-base transition-all"
                style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                Call us today
              </a>
            </div>

            <p className="text-sm mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              hello@curacareplatform.co.uk &nbsp;·&nbsp; Flat 1, 31 Knighton Road, Leicester, LE2 3HL
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
