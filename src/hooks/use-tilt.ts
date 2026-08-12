import { useCallback, useRef, type MouseEvent } from "react";

/**
 * Mouse-tracked 3D tilt. Attach the returned handlers to any element with
 * the `.tilt-card` class (see styles.css) — it rotates slightly toward the
 * cursor and exposes --mx/--my for a cursor-following spotlight glow.
 * No-ops gracefully under prefers-reduced-motion.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(strength = 10) {
  const ref = useRef<T | null>(null);
  const reducedRef = useRef<boolean | null>(null);

  const isReduced = () => {
    if (reducedRef.current === null) {
      reducedRef.current =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return reducedRef.current;
  };

  const onMouseMove = useCallback(
    (e: MouseEvent<T>) => {
      const node = ref.current;
      if (!node || isReduced()) return;
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * strength;
      const rotateX = (0.5 - py) * strength;
      node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.015)`;
      node.style.setProperty("--mx", `${px * 100}%`);
      node.style.setProperty("--my", `${py * 100}%`);
    },
    [strength],
  );

  const onMouseLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
