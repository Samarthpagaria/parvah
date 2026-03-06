"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Users, Building2, HardHat, Landmark, ArrowUpRight } from "lucide-react";
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
        "group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-500 hover:border-teal-200 hover:shadow-[0_12px_24px_-10px_rgba(8,131,149,0.08)]",
        className
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-teal-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50 text-neutral-900 transition-all duration-500 group-hover:bg-[#088395] group-hover:text-white group-hover:shadow-lg group-hover:shadow-teal-100">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900 group-hover:text-[#088395] transition-colors duration-300">
          <TranslatedText>{title}</TranslatedText>
        </h3>

        <p className="text-sm font-medium leading-relaxed text-neutral-500 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
          <TranslatedText>{description}</TranslatedText>
        </p>
      </div>

      <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-6 w-6 text-[#088395]" />
      </div>
    </motion.div>
  );
};

export function BeneficiariesSection() {
  return (
    <section className="bg-neutral-50/50 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-block rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#088395]">
              <TranslatedText>Who We Serve</TranslatedText>
            </div>
            <h2 className="mb-6 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl leading-[1.2]">
              <TranslatedText>Built for</TranslatedText> <span className="text-[#088395] italic font-serif"><TranslatedText>Every Workgroup</TranslatedText></span>, <br className="hidden md:block" />
              <span className="relative inline-block mt-1">
                <TranslatedText>Ensuring</TranslatedText>
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[#088395]/40 to-transparent rounded-full" />
              </span> <TranslatedText>Efficiency</TranslatedText>
            </h2>
            <p className="mx-auto max-w-xl text-base md:text-lg font-medium text-neutral-500 leading-relaxed opacity-80">
              <TranslatedText>Parvah serves users, administrators, and field staff, creating a closed loop of accountability from report to resolution.</TranslatedText>
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-4">
          {/* Citizens - Large Card */}
          <BeneficiaryCard
            title="Users"
            description="Anyone who needs a direct, reliable channel to report issues and track progress, without bureaucracy or dead ends."
            icon={Users}
            className="md:col-span-8 md:row-span-1"
            delay={0.1}
          />

          {/* Organization Administrators */}
          <BeneficiaryCard
            title="Admins"
            description="Managers who need full visibility and control over issue pipelines across their organizations or departments."
            icon={Building2}
            className="md:col-span-4 md:row-span-1"
            delay={0.2}
          />

          {/* Field Staff */}
          <BeneficiaryCard
            title="Field Staff"
            description="On-ground workers who receive clear assignments, add progress notes, and close issues with a full activity log."
            icon={HardHat}
            className="md:col-span-4 md:row-span-1"
            delay={0.3}
          />

          {/* Government & NGOs */}
          <BeneficiaryCard
            title="Enterprises & Teams"
            description="Any organization that needs transparent, auditable, role-based issue tracking to maintain high standards of service."
            icon={Landmark}
            className="md:col-span-8 md:row-span-1"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}
