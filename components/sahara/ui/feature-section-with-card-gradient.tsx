import {
  Speech,
  Camera,
  WifiOff,
  Calendar,
  Activity,
  LayoutDashboard,
  Siren,
  Globe
} from "lucide-react";

import { BackgroundRippleEffect } from "@/components/sahara/ui/background-ripple-effect";
import { TranslatedText } from "@/components/sahara/ui/translated-text";

export function FeaturesSectionWithCardGradient() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative group bg-neutral-50 p-4 rounded-xl overflow-hidden border border-neutral-200 transition-all duration-300 hover:shadow-xl hover:border-neutral-300 h-full flex flex-col items-start text-left"
            >
              <div className="absolute inset-0 z-0">
                <BackgroundRippleEffect
                  rows={8}
                  cols={8}
                  cellSize={40}
                />
              </div>

              <div className="relative z-20 pointer-events-none">
                <div className="mb-3 text-neutral-900 group-hover:scale-110 transition-transform duration-300">
                  <div className="h-6 w-6">
                    {feature.icon}
                  </div>
                </div>
                <p className="text-md font-bold text-neutral-900 leading-tight">
                  <TranslatedText>{feature.title}</TranslatedText>
                </p>
                <p className="text-xs font-semibold text-orange-600 mt-1">
                  <TranslatedText>{feature.subtitle}</TranslatedText>
                </p>
                <p className="text-neutral-600 mt-2 text-[11px] font-normal leading-relaxed">
                  <TranslatedText>{feature.description}</TranslatedText>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Voice-First AI",
    subtitle: "No keyboard. No typing. Just speak.",
    description: "Designed for the 300M+ Indians who struggle with typing, SAHARA puts voice at the center. Speak naturally in your language. SAHARA listens, understands, and responds out loud. No literacy barrier.",
    icon: <Speech className="h-6 w-6" />,
  },
  {
    title: "Medicine Scanner",
    subtitle: "Know what you're taking instantly.",
    description: "Point your camera at any medicine strip. SAHARA's AI identifies the medicine, explains what it treats, correct dosage, and warnings. All read aloud in your language. No more dangerous mistakes.",
    icon: <Camera className="h-6 w-6" />,
  },
  {
    title: "Works Offline",
    subtitle: "No signal? No problem.",
    description: "Our offline AI runs entirely on your device. Get instant guidance for 50+ common symptoms and emergencies even with zero connectivity. Because life doesn't wait for internet.",
    icon: <WifiOff className="h-6 w-6" />,
  },
  {
    title: "Book Consultations",
    subtitle: "A doctor, whenever you need one.",
    description: "Book in-person visits at your nearest PHC or connect via video call from home. Fully integrated with Ayushman Bharat and PMJAY, ensuring eligible families pay nothing.",
    icon: <Calendar className="h-6 w-6" />,
  },
  {
    title: "Personal Health Score",
    subtitle: "Your health history, always with you.",
    description: "SAHARA builds your profile over time. Your health score updates continuously, flagging warning signs (like recurring fevers) before they become emergencies. Prevention backed by data.",
    icon: <Activity className="h-6 w-6" />,
  },
  {
    title: "ASHA Worker Dashboard",
    subtitle: "Empowering village health workers.",
    description: "ASHA workers get a digital dashboard to manage patients, log home visits, and track high-risk cases for their entire village. When workers are empowered, villages become healthier.",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
  {
    title: "Emergency Detection",
    subtitle: "Seconds matter, SAHARA acts.",
    description: "Mention chest pain or difficult breathing. SAHARA immediately triggers Emergency Mode with one-tap dials to 108/112 and offline first-aid instructions read aloud.",
    icon: <Siren className="h-6 w-6" />,
  },
  {
    title: "Multilingual Access",
    subtitle: "India speaks many languages.",
    description: "Full voice and UI support for Hindi, Marathi, Bengali, Tamil and Telugu. Powered by India's Bhashini AI, ensuring regional dialects are understood accurately. Necessity, not luxury.",
    icon: <Globe className="h-6 w-6" />,
  },
];
