import { HeroSection } from "@/components/sahara/HeroSection";
import { FeaturesSectionWithCardGradient } from "@/components/sahara/ui/feature-section-with-card-gradient";
import { HowItWorks } from "@/components/sahara/ui/how-it-works";
import { BeneficiariesSection } from "@/components/sahara/ui/beneficiaries-section";
import { ImpactSection } from "@/components/sahara/ui/impact-section";
import { ParallaxVision } from "@/components/sahara/ui/parallax-vision";
import { WorldMapSection } from "@/components/sahara/ui/world-map-section";
import { PlayCircle } from "lucide-react";
import { TranslatedText } from "@/components/sahara/ui/translated-text";
import "./sahara-landing.css";

import { LanguageProvider } from "@/components/sahara/LanguageContext";

export default function Home() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-white sahara-landing-root">
      <HeroSection
        badge={{
          text: "AI-Powered · Voice-First · Offline Ready",
          action: {
            text: "Explore Technology",
            href: "#",
          },
        }}
        hindiTagline="सही समय पर, सही इलाज अब हर गांव में"
        title={
          <>
            <TranslatedText>Timely</TranslatedText> <span className="text-orange-600 italic font-serif drop-shadow-[0_0_10px_rgba(234,88,12,0.3)]"><TranslatedText>Access</TranslatedText></span> <TranslatedText>to the Right</TranslatedText> <span className="text-orange-600 italic font-serif drop-shadow-[0_0_10px_rgba(234,88,12,0.3)]"><TranslatedText>Healthcare</TranslatedText></span>.
          </>
        }
        description={
          <>
            <TranslatedText>SAHARA bridges the gap between rural communities and quality healthcare through</TranslatedText>{" "}
            <span className="text-orange-600 font-semibold drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">AI</span>,{" "}
            <span className="text-orange-600 font-semibold drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">voice</span>, <TranslatedText>and your</TranslatedText>{" "}
            <span className="text-orange-600 font-semibold drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]"><TranslatedText>own language</TranslatedText></span>.
            <TranslatedText>No internet? No problem.</TranslatedText>
          </>
        }
        actions={[
          {
            text: "Get Started Free",
            href: "/login",
            variant: "default",
          },
          {
            text: "See How It Works",
            href: "#",
            variant: "outline",
            icon: <PlayCircle className="h-5 w-5" />,
          },
        ]}
      />

      <section id="features" className="border-t border-neutral-100">
        <FeaturesSectionWithCardGradient />
      </section>

      <section id="how-it-works" className="border-t border-neutral-100">
        <HowItWorks />
      </section>

      <section id="beneficiaries" className="border-t border-neutral-100">
        <BeneficiariesSection />
      </section>

      <section id="impact" className="border-t border-neutral-100">
        <ImpactSection />
      </section>

      <section id="vision" className="border-t border-neutral-100">
        <ParallaxVision />
      </section>

      <section id="global-reach">
        <WorldMapSection />
      </section>

      </main>
    </LanguageProvider>
  );
}
