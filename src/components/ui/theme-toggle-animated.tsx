"use client";

import { motion, AnimatePresence } from "motion/react";

interface AnimatedToggleProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function AnimatedToggle({ theme, toggleTheme }: AnimatedToggleProps) {
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
          : "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)",
        boxShadow: isDark
          ? "inset 0 1px 2px rgba(0,0,0,0.3)"
          : "inset 0 1px 2px rgba(255,255,255,0.3)",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Stars (visible in dark mode) */}
      <AnimatePresence>
        {isDark && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-1.5 top-1 h-0.5 w-0.5 rounded-full bg-white"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="absolute right-2.5 top-2 h-0.5 w-0.5 rounded-full bg-white/70"
            />
          </>
        )}
      </AnimatePresence>

      {/* Cloud (visible in light mode) */}
      <AnimatePresence>
        {!isDark && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 0.7, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1 top-1 h-1.5 w-2 rounded-full bg-white/80"
          />
        )}
      </AnimatePresence>

      {/* Toggle knob with sun/moon */}
      <motion.div
        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
            : "linear-gradient(135deg, #fef08a 0%, #facc15 100%)",
          boxShadow: isDark
            ? "0 0 6px rgba(253, 230, 138, 0.5)"
            : "0 0 8px rgba(250, 204, 21, 0.6)",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        animate={{
          x: isDark ? 0 : 20,
        }}
      >
        {/* Sun rays (visible in light mode) */}
        <AnimatePresence>
          {!isDark && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-0.5 w-px rounded-full bg-yellow-400"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-8px)`,
                  }}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Moon crater (visible in dark mode) */}
        <AnimatePresence>
          {isDark && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute right-1 top-1 h-1 w-1 rounded-full bg-amber-600/30"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}

