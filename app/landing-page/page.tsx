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
          text: "Citizen-First · Transparent · Real-Time",
          action: {
            text: "See how it works",
            href: "#how-it-works",
          },
        }}
        hindiTagline="अपनी समस्या दर्ज करें, समाधान पाएं — अभी"
        title={
          <>
            <TranslatedText>Your City.</TranslatedText> <span className="text-orange-600 italic font-serif drop-shadow-[0_0_10px_rgba(234,88,12,0.3)]"><TranslatedText>Your Voice.</TranslatedText></span> <TranslatedText>Real</TranslatedText> <span className="text-orange-600 italic font-serif drop-shadow-[0_0_10px_rgba(234,88,12,0.3)]"><TranslatedText>Resolution.</TranslatedText></span>
          </>
        }
        description={
          <>
            <TranslatedText>Parvah bridges citizens and municipal bodies through</TranslatedText>{" "}
            <span className="text-orange-600 font-semibold drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">transparent</span>,{" "}
            <span className="text-orange-600 font-semibold drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">trackable</span>, <TranslatedText>and</TranslatedText>{" "}
            <span className="text-orange-600 font-semibold drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]"><TranslatedText>accountable</TranslatedText></span>{" "}
            <TranslatedText>civic issue resolution.</TranslatedText>
            <TranslatedText> No more ignored complaints.</TranslatedText>
          </>
        }
        actions={[
          {
            text: "Report an Issue",
            href: "/login",
            variant: "default",
          },
          {
            text: "Admin Portal",
            href: "/admin/login",
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
