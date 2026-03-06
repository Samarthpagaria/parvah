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
          text: "Connect · Manage · Resolve",
          action: {
            text: "See how it works",
            href: "#how-it-works",
          },
        }}
        hindiTagline="समस्या को रिपोर्ट करें, समाधान पाएं , सरलता से"
        title={
          <>
            <TranslatedText>Track.</TranslatedText> <span className="text-[#088395] italic font-serif drop-shadow-[0_0_10px_rgba(8,131,149,0.2)]"><TranslatedText>Manage.</TranslatedText></span> <TranslatedText>Real</TranslatedText> <span className="text-[#088395] italic font-serif drop-shadow-[0_0_10px_rgba(8,131,149,0.2)]"><TranslatedText>Resolution.</TranslatedText></span>
          </>
        }
        description={
          <>
            <TranslatedText>Parvah connects people and organizations through</TranslatedText>{" "}
            <span className="text-[#088395] font-semibold drop-shadow-[0_0_8px_rgba(8,131,149,0.3)]">transparent</span>,{" "}
            <span className="text-[#088395] font-semibold drop-shadow-[0_0_8px_rgba(8,131,149,0.3)]">trackable</span>, <TranslatedText>and</TranslatedText>{" "}
            <span className="text-[#088395] font-semibold drop-shadow-[0_0_8px_rgba(8,131,149,0.3)]"><TranslatedText>accountable</TranslatedText></span>{" "}
            <TranslatedText>issue resolution. No more ignored requests.</TranslatedText>
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
