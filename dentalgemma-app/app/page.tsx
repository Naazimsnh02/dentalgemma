import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import { AIShowcase } from "@/components/landing/ai-showcase";
import { TechStack } from "@/components/landing/tech-stack";
import { CtaSection } from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AIShowcase />
      <TechStack />
      <CtaSection />
      <Footer />
    </>
  );
}
