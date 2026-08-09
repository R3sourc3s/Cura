import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import AISection from "@/components/AISection";
import Compliance from "@/components/Compliance";
import CareGallery from "@/components/CareGallery";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function Home() {
  return (
    <main id="main-content" style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <AISection />
      <Compliance />
      <CareGallery />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
      <CookieBanner />
    </main>
  );
}
