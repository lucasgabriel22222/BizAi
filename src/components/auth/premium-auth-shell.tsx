"use client";

import { motion } from "framer-motion";
import { PremiumBackground } from "@/components/marketing/premium-background";

interface PremiumAuthShellProps {
  children: React.ReactNode;
}

export function PremiumAuthShell({ children }: PremiumAuthShellProps) {
  return (
    <div className="relative min-h-screen text-white">
      <PremiumBackground />
      <div className="relative flex min-h-screen items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] flex justify-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
