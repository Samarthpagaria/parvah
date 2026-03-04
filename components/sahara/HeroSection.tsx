"use client";

import { Button } from "@/components/sahara/ui/button";
import { Badge } from "@/components/sahara/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiningText } from "@/components/sahara/ui/shining-text";
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
    <section className="bg-white py-8 sm:py-12 md:py-16 px-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 pt-4 sm:gap-12">
        <div className="flex flex-col items-center gap-3 text-center sm:gap-6">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2 py-1 px-3.5 rounded-full border-orange-100 bg-orange-50/30">
              <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1 font-semibold text-orange-600 text-[10px] sm:text-xs hover:text-orange-700 transition-colors">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Hindi Tagline with Shine */}
          {hindiTagline && (
            <div className="animate-appear -mb-4 delay-100">
              <ShiningText 
                text={hindiTagline} 
                className="text-sm md:text-base font-medium" 
              />
            </div>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear text-neutral-900 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:max-w-3xl tracking-tight">
            {title}
          </h1>

          {/* Description */}
          <div className="text-xs relative z-10 max-w-[550px] animate-appear font-medium text-neutral-500 delay-300 sm:text-sm leading-relaxed">
            {description}
          </div>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-2.5 delay-700">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant} size="sm" asChild className="rounded-full px-5 py-4 h-auto text-sm">
                <Link href={action.href} className="flex items-center gap-2">
                  {action.icon}
                  {action.text}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
