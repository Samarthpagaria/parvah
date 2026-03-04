"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Users, HeartPulse, Baby, HardHat, ArrowUpRight } from "lucide-react";
import { TranslatedText } from "@/components/sahara/ui/translated-text";

const BeneficiaryCard = ({
  title,
  description,
  icon: Icon,
  className,
  delay = 0
}: {
  title: string;
  description: string;
  icon: any;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 transition-all duration-500 hover:border-orange-200 hover:shadow-[0_20px_40px_-15px_rgba(234,88,12,0.1)]",
        className
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-900 transition-all duration-500 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-200">
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-orange-600 transition-colors duration-300">
          <TranslatedText>{title}</TranslatedText>
        </h3>

        <p className="text-lg font-medium leading-relaxed text-neutral-500 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
          <TranslatedText>{description}</TranslatedText>
        </p>
      </div>

      <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-6 w-6 text-orange-600" />
      </div>
    </motion.div>
  );
};

export function BeneficiariesSection() {
  return (
    <section className="bg-neutral-50/50 py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-block rounded-full bg-orange-50 border border-orange-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
              <TranslatedText>Who We Serve</TranslatedText>
            </div>
            <h2 className="mb-6 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl leading-[1.2]">
              <TranslatedText>Built for</TranslatedText> <span className="text-orange-600 italic font-serif"><TranslatedText>Every Indian</TranslatedText></span>, <br className="hidden md:block" />
              <span className="relative inline-block mt-1">
                <TranslatedText>Forgotten</TranslatedText>
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-orange-600/40 to-transparent rounded-full" />
              </span> <TranslatedText>by Healthcare</TranslatedText>
            </h2>
            <p className="mx-auto max-w-xl text-base md:text-lg font-medium text-neutral-500 leading-relaxed opacity-80">
              <TranslatedText>Sahara is designed to reach the last mile, ensuring no one is left behind in India's healthcare revolution.</TranslatedText>
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-2 lg:gap-8">
          {/* Rural Families - Large Card */}
          <BeneficiaryCard
            title="Rural Families"
            description="Remote villages with no nearby clinic. Sahara brings quality guidance to their doorstep."
            icon={Users}
            className="md:col-span-8 md:row-span-1"
            delay={0.1}
          />

          {/* Elderly Patients */}
          <BeneficiaryCard
            title="Elderly Patients"
            description="Limited mobility, need voice-based help."
            icon={HeartPulse}
            className="md:col-span-4 md:row-span-1"
            delay={0.2}
          />

          {/* Women & Children */}
          <BeneficiaryCard
            title="Women & Children"
            description="Maternal care, child health guidance for a healthier next generation."
            icon={Baby}
            className="md:col-span-4 md:row-span-1"
            delay={0.3}
          />

          {/* ASHA / NGO Workers */}
          <BeneficiaryCard
            title="ASHA / NGO Workers"
            description="Tools to manage community health. Empowering the backbone of rural healthcare."
            icon={HardHat}
            className="md:col-span-8 md:row-span-1"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}
