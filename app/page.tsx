import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Features from "@/components/Features";
import FeatureGrid from "@/components/FeatureGrid";
import Integrations from "@/components/Integrations";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Brands />
      <Features />
      <FeatureGrid />
      <Integrations />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
