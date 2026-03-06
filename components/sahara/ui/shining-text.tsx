"use client";

import * as React from "react"
import { motion } from "framer-motion";

export function ShiningText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-red-600 via-red-400 to-red-600 bg-[length:200%_100%] bg-clip-text text-transparent font-sans ${className}`}
      animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "linear",
      }}
    >
      {text}
    </motion.span>
  );
}
