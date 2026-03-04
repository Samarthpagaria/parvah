"use client";

import * as React from "react"
import { motion } from "framer-motion";

export function ShiningText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-orange-700 via-orange-300 to-orange-700 bg-[length:200%_100%] bg-clip-text text-transparent ${className}`}
      animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "linear",
      }}
    >
      {text}
    </motion.span>
  );
}
