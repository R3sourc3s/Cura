"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare, Headphones, Newspaper, HelpCircle, CheckCircle } from "lucide-react";

const contactOptions = [
  { icon: MessageSquare, title: "Sales", desc: "Talk to our team about pricing and demos", email: "sales@curacareplatform.co.uk", color: "#7c3aed" },
  { icon: Headphones, title: "Support", desc: "Get help with technical issues", email: "support@curacareplatform.co.uk", color: "#3b82f6" },
  { icon: Newspaper, title: "Press", desc: "Media enquiries and press kit requests", email: "press@curacareplatform.co.uk", color: "#06b6d4" },
  { icon: HelpCircle, title: "General", desc: "Anything else — we're here to help", email: "hello@curacareplatform.co.uk", color: "#10b981" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "Sales enquiry", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.85)",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
    fontSize: "0.875rem",
  } as const;

  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Contact</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Get in touch</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Whether you have a question, want a demo, or just want to say hello — we&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: contact info */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactOptions.map(({ icon: Icon, title, desc, email, color }) => (
                  <div key={title} className="glass rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">{title}</div>
                    <div className="text-gray-500 text-xs mb-2">{desc}</div>
                    <a href={`mailto:${email}`} className="text-xs" style={{ color }}>{email}</a>
                  </div>
                ))}
              </div>

              <div className="glass rounded-2xl p-6 space-y-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-white font-semibold mb-4">Contact details</h3>
                {[
                  { icon: Mail, text: "hello@curacareplatform.co.uk" },
                  { icon: Phone, text: "+44 20 1234 5678" },
                  { icon: MapPin, text: "1 London Bridge, London, SE1 9BG" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={16} style={{ color: "#a78bfa" }} />
                    <span className="text-gray-400 text-sm">{text}</span>
                  </div>
                ))}
                <div className="pt-2 text-xs text-gray-500 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  We typically respond within 1 business day. Support hours: Mon–Fri 8am–8pm BST.
                </div>
              </div>
            </div>

            {/* Right: contact form */}
            <div className="glass rounded-2xl p-8" style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <CheckCircle size={28} style={{ color: "#10b981" }} />
                  </div>
                  <h3 className="text-white text-xl font-bold">Message sent!</h3>
                  <p className="text-gray-400 text-sm max-w-xs">Thanks for reaching out. We&apos;ll get back to you within one business day.</p>
                  <button onClick={() => setSent(false)} className="text-sm mt-2" style={{ color: "#a78bfa" }}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-white font-semibold text-lg mb-6">Send us a message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Full name *</label>
                      <input required style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Work email *</label>
                      <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@carehome.co.uk" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Company / care home</label>
                    <input style={inputStyle} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Sunrise Care Group" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Subject</label>
                    <select style={inputStyle} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                      {["Sales enquiry", "Technical support", "Billing", "Press", "Partnership", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Message *</label>
                    <textarea required rows={5} style={{ ...inputStyle, resize: "none" }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us how we can help…" />
                  </div>
                  <button type="submit" className="w-full py-3 text-sm font-semibold rounded-xl text-white glow-button" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
