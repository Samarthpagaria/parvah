"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/sahara/ui/animated-beam";
import { Timer, Hospital, Globe, Zap, Activity } from "lucide-react";
import { TranslatedText } from "@/components/sahara/ui/translated-text";

const ImpactCard = ({
  title,
  value,
  description,
  className,
  cardRef
}: {
  title: string;
  value: string;
  description: string;
  className?: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div
      ref={cardRef}
      className={cn(
        "relative flex flex-col p-6 rounded-[1.5rem] border border-neutral-200/50 bg-white/80 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_12px_32px_rgba(234,88,12,0.1)] hover:border-orange-200 group z-20 w-full max-w-[260px]",
        className
      )}
    >
      <div className="relative z-10">
        <div className="text-[9px] font-black text-orange-600 mb-2 uppercase tracking-[0.2em] inline-block px-2 py-0.5 bg-orange-50 rounded-md">
          <TranslatedText>{title}</TranslatedText>
        </div>
        <div className="text-xl font-bold text-neutral-900 mb-2 leading-tight tracking-tight group-hover:text-orange-600 transition-colors duration-500">
          <TranslatedText>{value}</TranslatedText>
        </div>
        <p className="text-[11px] font-medium text-neutral-500 leading-normal opacity-70 group-hover:opacity-100 transition-opacity duration-500">
          <TranslatedText>{description}</TranslatedText>
        </p>
      </div>

      <div className="absolute bottom-3 right-3 h-[2px] w-8 bg-orange-100/50 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-orange-500 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(234,88,12,1), transparent)' }} />
      </div>
    </div>
  );
};

export function ImpactSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 bg-white overflow-hidden relative border-t border-neutral-50">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ea580c 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10" ref={containerRef}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-3 py-1 mb-4 text-[9px] font-bold tracking-[0.15em] uppercase text-orange-600 bg-orange-50 border border-orange-100 rounded-full">
              <TranslatedText>Measurable Change</TranslatedText>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mb-4">
              <TranslatedText>What</TranslatedText> <span className="text-orange-600 italic font-serif">SAHARA</span> <TranslatedText>Changes</TranslatedText>
            </h2>
            <p className="text-neutral-500 font-medium max-w-lg mx-auto text-sm opacity-80">
              <TranslatedText>Precise metrics from our last-mile healthcare deployments.</TranslatedText>
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-8 w-full lg:w-1/3 items-center lg:items-end order-2 lg:order-1">
            <ImpactCard
              cardRef={card1Ref}
              title="THE SHIFT"
              value="Before 4 Days. Now 4 Hours."
              description="Rural patients used to wait days for basic health guidance."
            />
            <ImpactCard
              cardRef={card3Ref}
              title="THE BARRIER"
              value="No Reading. Just Speak."
              description="Voice AI works for everyone, literate or not."
            />
          </div>

          {/* Center Column with Hub */}
          <div className="w-full lg:w-1/4 order-1 lg:order-2 flex items-center justify-center">
            <div className="relative">
              <div
                ref={centerRef}
                className="h-20 w-20 rounded-full bg-neutral-900 flex items-center justify-center z-30 border-[6px] border-white shadow-xl relative"
              >
                <Activity className="h-7 w-7 text-orange-500" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-400 to-amber-200 opacity-20 blur-sm -z-10" />
              </div>
              <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl animate-pulse -z-20" />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8 w-full lg:w-1/3 items-center lg:items-start order-3 lg:order-3">
            <ImpactCard
              cardRef={card2Ref}
              title="THE FIX"
              value="Wrong Medicines: Solved"
              description="Scanner prevents dangerous mistakes before they happen."
            />
            <ImpactCard
              cardRef={card4Ref}
              title="THE SAFETY"
              value="108 in One Tap. Always."
              description="Emergency detection that never sleeps."
            />
          </div>
        </div>

        {/* Neural Beams */}
        <div className="hidden lg:block pointer-events-none">
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={card1Ref}
            curvature={-40}
            duration={5}
            pathColor="#f8fafc"
            gradientStartColor="#ea580c"
            gradientStopColor="#fbbf24"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={card2Ref}
            curvature={40}
            duration={6}
            delay={1}
            pathColor="#f8fafc"
            gradientStartColor="#ea580c"
            gradientStopColor="#fbbf24"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={card3Ref}
            curvature={30}
            duration={7}
            delay={2}
            pathColor="#f8fafc"
            gradientStartColor="#ea580c"
            gradientStopColor="#fbbf24"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={card4Ref}
            curvature={-30}
            duration={5}
            delay={0.5}
            pathColor="#f8fafc"
            gradientStartColor="#ea580c"
            gradientStopColor="#fbbf24"
          />
        </div>
      </div>
    </section>
  );
}
