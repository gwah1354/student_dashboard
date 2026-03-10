import { ReactNode, MouseEvent, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const GlassCard = ({ children, className, delay = 0 }: GlassCardProps) => {
  const ref = useRef<HTMLDivElement>(null!);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--glow-opacity", "1");
  }, []);

  const onMouseLeave = useCallback(() => {
    ref.current?.style.setProperty("--glow-opacity", "0");
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("liquid-glass glass-glow-container p-6", className)}
    >
      {/* Cursor-following glow overlay */}
      <div
        className="glass-glow-effect pointer-events-none absolute inset-0 z-[2] rounded-[inherit] transition-opacity duration-500"
        style={{
          background: `radial-gradient(320px circle at var(--glow-x, 50%) var(--glow-y, 50%), hsl(var(--primary) / 0.12), hsl(var(--accent) / 0.06) 40%, transparent 70%)`,
          opacity: "var(--glow-opacity, 0)",
        }}
      />
      {/* Border glow */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] transition-opacity duration-500"
        style={{
          background: `radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), hsl(var(--primary) / 0.20), transparent 50%)`,
          opacity: "var(--glow-opacity, 0)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      {children}
    </motion.div>
  );
};

export default GlassCard;
