import { useRef, useCallback, MouseEvent } from "react";

interface UseGlassGlowReturn {
  ref: React.RefObject<HTMLDivElement>;
  onMouseMove: (e: MouseEvent) => void;
  onMouseLeave: () => void;
}

export function useGlassGlow(): UseGlassGlowReturn {
  const ref = useRef<HTMLDivElement>(null!);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--glow-x", `${x}px`);
    el.style.setProperty("--glow-y", `${y}px`);
    el.style.setProperty("--glow-opacity", "1");
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--glow-opacity", "0");
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
