import { HeroSection } from "@/components/sahara/HeroSection";
import { FeaturesSectionWithCardGradient } from "@/components/sahara/ui/feature-section-with-card-gradient";
import { HowItWorks } from "@/components/sahara/ui/how-it-works";
import { BeneficiariesSection } from "@/components/sahara/ui/beneficiaries-section";
import { ImpactSection } from "@/components/sahara/ui/impact-section";
import { ParallaxVision } from "@/components/sahara/ui/parallax-vision";
import { WorldMapSection } from "@/components/sahara/ui/world-map-section";
import { TranslatedText } from "@/components/sahara/ui/translated-text";
import { Typewriter } from "@/components/ui/typewriter-text";
import "./landing-page/sahara-landing.css";

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
            <TranslatedText>Track.</TranslatedText> <span className="text-[#088395] font-semibold"><TranslatedText>Manage.</TranslatedText></span> <TranslatedText>Real</TranslatedText>{" "}
            <Typewriter 
              text={["Resolution.", "Accountability.", "Efficiency.", "Transparency."]}
              speed={100}
              loop={true}
              className="text-[#088395] font-semibold"
            />
          </>
        }
        description={
          <>
            <TranslatedText>Parvah connects people and organizations through</TranslatedText>{" "}
            <span className="text-[#088395] font-semibold">transparent</span>,{" "}
            <span className="text-[#088395] font-semibold">trackable</span>, <TranslatedText>and</TranslatedText>{" "}
            <span className="text-[#088395] font-semibold"><TranslatedText>accountable</TranslatedText></span>{" "}
            <TranslatedText>issue resolution. No more ignored requests.</TranslatedText>
          </>
        }
        actions={[
          {
            text: "Citizen login",
            href: "/login",
            variant: "default",
          },
          {
            text: "Admin login",
            href: "/admin/login",
            variant: "outline",
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
