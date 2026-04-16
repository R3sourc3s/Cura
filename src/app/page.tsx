import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import AISection from "@/components/AISection";
import Compliance from "@/components/Compliance";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <AISection />
      <Compliance />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
