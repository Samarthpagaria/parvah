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
      title: "A Global Network, Rooted in Your Village.",
      content: "Healthcare should not be defined by your PIN code. While the world makes massive leaps in medical technology, rural communities are often left navigating the gap between high-tech urban centers and local accessibility. SAHARA is designed to bridge this divide by bringing world-class health intelligence directly to the palm of your hand. By syncing global medical standards with the unique needs of rural India, we ensure that every family has a reliable, instant, and expert companion for their wellness journey."
    },
    {
      title: "Intelligence That Speaks Your Language.",
      content: "True healthcare empowerment begins with understanding. We’ve removed the friction of complex app stores and high-spec hardware requirements, ensuring that SAHARA works seamlessly on any device. By utilizing advanced natural language processing, we provide accurate health guidance in over 20 regional dialects, ensuring that your symptoms are understood and your concerns are addressed in the language you speak at home."
    },
    {
      title: "Building a Safer, Healthier Tomorrow.",
      content: "Trust is the foundation of every consultation. SAHARA operates as a 24/7 diagnostic ally, providing free and instant clarity when you need it most. Our mission is to turn every smartphone into a gateway for professional-grade health support, reducing the burden on local clinics. We are mapping a future where \"distance\" is no longer a barrier to a healthy life."
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
                    <Badge variant="outline" className="mb-4 border-orange-200 text-orange-600 bg-orange-100/30 uppercase tracking-[0.2em] font-bold py-0.5 px-3 text-[9px] rounded-full border-none">
                      Focus Area 0{idx + 1}
                    </Badge>
                    <h3 className="text-2xl md:text-4xl font-black text-neutral-900 mb-6 leading-[1.2] tracking-tight whitespace-normal">
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
