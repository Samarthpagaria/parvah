"use client";

import { useRef } from "react";
import { UserPlus, MessageSquareText, ShieldPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AnimatedBeam } from "@/components/sahara/ui/animated-beam";
import { TranslatedText } from "@/components/sahara/ui/translated-text";

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const stepRefs = [step1Ref, step2Ref, step3Ref];

  return (
    <section className="py-32 bg-white overflow-hidden relative">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ea580c 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 mb-4 text-[10px] font-bold tracking-widest uppercase text-orange-600 bg-orange-50 rounded-full">
            <TranslatedText>Journey</TranslatedText>
          </div>
          <h2 className="text-4xl font-extrabold text-neutral-900 sm:text-5xl tracking-tight">
            <TranslatedText>How It Works</TranslatedText>
          </h2>
          <p className="mt-6 text-neutral-500 font-medium max-w-2xl mx-auto text-lg">
            <TranslatedText>A simple, three-step process designed for the heart of India.</TranslatedText>
          </p>
        </div>

        <div className="relative" ref={containerRef}>
          {/* Animated Beams Connector (Desktop only) */}
          <div className="hidden lg:block">
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step1Ref}
              toRef={step2Ref}
              curvature={-50}
              duration={4}
              pathColor="#f3f4f6"
              gradientStartColor="#ea580c"
              gradientStopColor="#f97316"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step2Ref}
              toRef={step3Ref}
              curvature={50}
              duration={4}
              delay={2}
              pathColor="#f3f4f6"
              gradientStartColor="#ea580c"
              gradientStopColor="#f97316"
            />
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-3 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center text-center group">
                <div className="relative mb-10">
                  <div
                    ref={stepRefs[index]}
                    className="h-24 w-24 rounded-[32px] bg-white border border-neutral-100 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgb(234,88,12,0.1)] group-hover:border-orange-100 transition-all duration-500 relative z-20"
                  >
                    <div className="text-neutral-900 group-hover:text-orange-600 transition-colors duration-500 group-hover:scale-110">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-neutral-900 text-white text-sm font-bold flex items-center justify-center border-[6px] border-white shadow-sm z-30">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight group-hover:text-orange-600 transition-colors duration-500">
                  <TranslatedText>{step.title}</TranslatedText>
                </h3>
                <p className="text-neutral-500 text-base leading-relaxed max-w-[300px] font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  <TranslatedText>{step.description}</TranslatedText>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Register in Seconds",
    description: "Use your mobile number. No email needed. Select your language and you're ready.",
    icon: <UserPlus className="h-8 w-8" />,
  },
  {
    number: "02",
    title: "Describe Your Symptoms",
    description: "Speak or type how you feel in your own language. SAHARA listens and understands.",
    icon: <MessageSquareText className="h-8 w-8" />,
  },
  {
    number: "03",
    title: "Get Instant Guidance",
    description: "AI gives you clear advice, identifies medicines, and connects you to a doctor.",
    icon: <ShieldPlus className="h-8 w-8" />,
  },
];
