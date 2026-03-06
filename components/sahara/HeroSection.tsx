"use client";

import { Button } from "@/components/sahara/ui/button";
import { Badge } from "@/components/sahara/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiningText } from "@/components/sahara/ui/shining-text";
import { LightRays } from "@/components/ui/light-rays";
import { GradientButton } from "@/components/ui/gradient-button";
import Link from "next/link";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: React.ReactNode;
  description: React.ReactNode;
  actions: HeroAction[];
  hindiTagline?: string;
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  hindiTagline,
}: HeroProps) {

  return (
    <section className="relative py-12 sm:py-20 bg-white overflow-hidden">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#088395 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      {/* Dynamic Background Rays */}
      <LightRays 
        color="rgba(8, 131, 149, 0.12)" 
        count={8} 
        blur={40} 
        speed={16} 
        className="opacity-50"
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 pt-4 sm:gap-12 relative z-10">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-8">
          {/* Badge */}
          {badge && (
            <div className="animate-appear">
              <Badge variant="outline" className="gap-2 py-1.5 px-4 rounded-full border-teal-100 bg-teal-50/30 backdrop-blur-sm">
                <span className="text-[10px] sm:text-xs text-neutral-500 font-semibold tracking-wide">{badge.text}</span>
                <a href={badge.action.href} className="flex items-center gap-1 font-bold text-[#088395] text-[10px] sm:text-xs hover:text-[#066472] transition-colors">
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3" />
                </a>
              </Badge>
            </div>
          )}

          {/* Hindi Tagline with Shine */}
          {hindiTagline && (
            <div className="animate-appear -mb-3 delay-100">
              <ShiningText 
                text={hindiTagline} 
                className="text-xs md:text-sm font-normal" 
              />
            </div>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear text-neutral-900 text-xl font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-4xl xl:max-w-3xl tracking-tight font-sans">
            {title}
          </h1>

          {/* Description */}
          <div className="text-[10px] sm:text-xs relative z-10 max-w-[500px] animate-appear font-normal text-neutral-500 delay-300 leading-relaxed">
            {description}
          </div>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-2.5 delay-700">
            {actions.map((action, index) => (
              <GradientButton 
                key={index} 
                variant={action.text.toLowerCase().includes("admin") ? "variant" : "default"} 
                asChild 
                className={cn(
                  "relative rounded-full px-8 py-4 h-auto text-sm overflow-hidden min-w-[160px]"
                )}
              >
                <Link href={action.href} className="flex items-center justify-center w-full h-full">
                  {action.text}
                </Link>
              </GradientButton>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
