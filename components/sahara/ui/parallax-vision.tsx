"use client";

import React, { useRef, useState } from "react";
import { useScroll, useTransform, motion, useSpring, useMotionValueEvent } from "framer-motion";
import { Globe } from "@/components/sahara/ui/globe";
import { TextLoop } from "@/components/sahara/ui/text-loop";
import { Badge } from "@/components/sahara/ui/badge";
import { TranslatedText } from "@/components/sahara/ui/translated-text";

export function ParallaxVision() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 25,
    restDelta: 0.001
  });

  // Calculate which narrative point is active based on scroll (3 sections total)
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
    if (latest < 0.33) setActiveIndex(0);
    else if (latest < 0.66) setActiveIndex(1);
    else setActiveIndex(2);
  });

  // Scale, rotation, and parallax effects
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1.1, 1.4, 1.2]);
  const rotate = useTransform(smoothProgress, [0, 1], [0, 60]);
  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(smoothProgress, [0, 1], [40, -40]); // Subtle parallax lift

  const sections = [
    {
      title: "Accountability, Built Into Every Step.",
      content: "Accountability shouldn't require persistence. In many organizations, a user who files a report has no idea what happens next. There is no confirmation, no timeline, and no clear path to resolution. Parvah changes this by creating a complete, auditable record of every action taken, from the moment it is filed to the moment it is resolved. Every status change, note, and assignment is timestamped and attributed. Entities become transparent by default."
    },
    {
      title: "From Complaint to Resolution. In Hours, Not Weeks.",
      content: "The gap between a pot hole being reported and a pothole being repaired used to be measured in months. Parvah compresses that timeline by making it impossible to lose an issue in a pile of emails or a missed phone call. The moment a citizen files a report, it enters a structured workflow. Admins triage, assign, and track. Staff receive tasks directly. Citizens are notified at every step. Nothing falls through the cracks."
    },
    {
      title: "One Platform. Every Organization. Real Scale.",
      content: "Parvah is not a limited solution. It is designed to power issue management across multiple organizations, teams, and jurisdictions under one unified platform. Maintenance, logistics, services, support, each entity gets its own issue pipeline, its own staff, and its own categories. Administrators have a bird's-eye view of everything. Scale without chaos. Management without bureaucracy."
    }
  ];

  return (
    <section ref={containerRef} className="relative bg-[#fafafa] h-[300vh]">

      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            {/* Left Column - Scroll-Driven Text Loop */}
            <motion.div
              style={{ y: textY }}
              className="w-full lg:w-1/2 min-h-[450px] flex flex-col justify-center"
            >
              <TextLoop
                index={activeIndex}
                className="w-full"
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                {sections.map((section, idx) => (
                  <div key={idx} className="flex flex-col items-start w-full">
                    <Badge variant="outline" className="mb-4 border-teal-200 text-[#088395] bg-teal-100/30 uppercase tracking-[0.2em] font-bold py-0.5 px-3 text-[9px] rounded-full border-none">
                      Focus Area 0{idx + 1}
                    </Badge>
                    <h3 className="text-2xl md:text-4xl font-semibold text-neutral-900 mb-6 leading-[1.2] tracking-tight whitespace-normal">
                      <TranslatedText>{section.title}</TranslatedText>
                    </h3>
                    <p className="text-base md:text-lg text-neutral-600 font-medium leading-relaxed opacity-80 whitespace-normal">
                      <TranslatedText>{section.content}</TranslatedText>
                    </p>
                  </div>
                ))}
              </TextLoop>
            </motion.div>

            {/* Right Column - Sticky Globe */}
            <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end">
              <div className="relative">
                <motion.div
                  style={{ scale, rotate }}
                  className="relative w-[500px] md:w-[700px] aspect-square lg:translate-x-20"
                >
                  <Globe className="opacity-100" />

                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
