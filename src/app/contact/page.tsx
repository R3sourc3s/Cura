"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare, Headphones, Newspaper, HelpCircle, CheckCircle } from "lucide-react";

const GREEN = "#2d5a3d";

const contactOptions = [
  { icon: MessageSquare, title: "Sales",   desc: "Talk to our team about pricing and demos", email: "sales@curacareplatform.co.uk",   color: GREEN },
  { icon: Headphones,    title: "Support", desc: "Get help with technical issues",            email: "support@curacareplatform.co.uk", color: "#b8923a" },
  { icon: Newspaper,     title: "Press",   desc: "Media enquiries and press kit requests",    email: "press@curacareplatform.co.uk",   color: GREEN },
  { icon: HelpCircle,    title: "General", desc: "Anything else — we're here to help",        email: "hello@curacareplatform.co.uk",   color: "#b8923a" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "Sales enquiry", message: "" });
  const [sent, setSent] = useState(false);

  const inputStyle: React.CSSProperties = {
    background: "#faf7f0",
    border: "1px solid #dfd8cc",
    color: "#1c1a14",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
    fontSize: "0.875rem",
  };

  return (
    <main style={{ background: "#faf7f0", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GREEN }}>Contact</p>
            <h1 className="lp-serif text-4xl lg:text-5xl font-bold mb-4" style={{ color: "#1c1a14" }}>Get in touch</h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#7a7468" }}>
              Whether you have a question, want a demo, or just want to say hello — we&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactOptions.map(({ icon: Icon, title, desc, email, color }) => (
                  <div key={title} className="lp-card rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="font-semibold text-sm mb-1" style={{ color: "#1c1a14" }}>{title}</div>
                    <div className="text-xs mb-2" style={{ color: "#7a7468" }}>{desc}</div>
                    <a href={`mailto:${email}`} className="text-xs underline underline-offset-2" style={{ color }}>{email}</a>
                  </div>
                ))}
              </div>

              <div className="lp-card rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold mb-4" style={{ color: "#1c1a14" }}>Contact details</h3>
                {[
                  { icon: Mail,   text: "hello@curacareplatform.co.uk" },
                  { icon: Phone,  text: "+44 20 1234 5678" },
                  { icon: MapPin, text: "1 London Bridge, London, SE1 9BG" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={16} style={{ color: GREEN }} />
                    <span className="text-sm" style={{ color: "#7a7468" }}>{text}</span>
                  </div>
                ))}
                <div className="pt-2 text-xs border-t" style={{ color: "#a89f94", borderColor: "#dfd8cc" }}>
                  We typically respond within 1 business day. Support hours: Mon–Fri 8am–8pm BST.
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lp-card rounded-2xl p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(45,90,61,0.1)", border: "1px solid rgba(45,90,61,0.25)" }}>
                    <CheckCircle size={26} style={{ color: GREEN }} />
                  </div>
                  <h3 className="lp-serif text-xl font-bold" style={{ color: "#1c1a14" }}>Message sent!</h3>
                  <p className="text-sm max-w-xs" style={{ color: "#7a7468" }}>Thanks for reaching out. We&apos;ll get back to you within one business day.</p>
                  <button onClick={() => setSent(false)} className="text-sm mt-2 underline underline-offset-2" style={{ color: GREEN }}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                  <h3 className="lp-serif text-lg font-bold mb-6" style={{ color: "#1c1a14" }}>Send us a message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a7468" }}>Full name *</label>
                      <input required style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith"
                        onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")} onBlur={e => (e.target.style.borderColor = "#dfd8cc")} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a7468" }}>Work email *</label>
                      <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@carehome.co.uk"
                        onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")} onBlur={e => (e.target.style.borderColor = "#dfd8cc")} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a7468" }}>Company / care home</label>
                    <input style={inputStyle} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Sunrise Care Group"
                      onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")} onBlur={e => (e.target.style.borderColor = "#dfd8cc")} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a7468" }}>Subject</label>
                    <select style={inputStyle} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                      {["Sales enquiry","Technical support","Billing","Press","Partnership","Other"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a7468" }}>Message *</label>
                    <textarea required rows={5} style={{ ...inputStyle, resize: "none" }} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us how we can help…"
                      onFocus={e => (e.target.style.borderColor = "rgba(45,90,61,0.5)")} onBlur={e => (e.target.style.borderColor = "#dfd8cc")} />
                  </div>
                  <button type="submit" className="lp-btn-primary w-full py-3 text-sm font-semibold rounded-xl text-white">
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
