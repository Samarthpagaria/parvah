"use client";

import WorldMap from "@/components/sahara/ui/world-map";
import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function WorldMapSection() {
  return (
    <div className="pb-8 pt-0 bg-[#fafafa] w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* World Map - Cut to Half and Masked */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_40%,transparent_90%)]">
          <div className="absolute top-0 left-0 w-full">
            <WorldMap
              lineColor="#ea580c"
              dots={[
                {
                  start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
                  end: { lat: 51.5074, lng: -0.1278, label: "London" },
                },
                {
                  start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
                  end: { lat: 40.7128, lng: -74.006, label: "New York" },
                },
                {
                  start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
                  end: { lat: 35.6762, lng: 139.6503, label: "Tokyo" },
                },
                {
                  start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
                  end: { lat: -33.8688, lng: 151.2093, label: "Sydney" },
                },
                {
                  start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
                  end: { lat: 25.2048, lng: 55.2708, label: "Dubai" },
                },
                {
                  start: { lat: 19.076, lng: 72.8777, label: "Mumbai" },
                  end: { lat: 1.3521, lng: 103.8198, label: "Singapore" },
                },
              ]}
            />
          </div>
        </div>

        {/* Minimalist Small Footer */}
        <div className="pt-6 pb-2 border-t border-neutral-200/50 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="order-2 md:order-1">
             <span className="text-lg font-black text-neutral-900 tracking-tighter uppercase italic font-serif">Sahara</span>
          </div>

          <div className="flex items-center gap-5 order-1 md:order-2 opacity-60 hover:opacity-100 transition-opacity">
            <Link href="#" className="text-neutral-500 hover:text-orange-600 transition-colors">
              <Twitter className="w-3.5 h-3.5" />
            </Link>
            <Link href="#" className="text-neutral-500 hover:text-orange-600 transition-colors">
              <Linkedin className="w-3.5 h-3.5" />
            </Link>
            <Link href="#" className="text-neutral-500 hover:text-orange-600 transition-colors">
              <Github className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] order-3">
             &copy; 2026 Infrastructure Layer
          </div>
        </div>
      </div>
    </div>
  );
}
