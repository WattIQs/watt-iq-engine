import { useEffect, useRef } from "react";

type Options = {
  max?: number;
  perspective?: number;
  scale?: number;
};

export function useTilt<T extends HTMLElement = HTMLDivElement>({
  max = 5,
  perspective = 1000,
  scale = 1.008,
}: Options = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      node.style.setProperty("--tilt-x", `${currentY.toFixed(3)}deg`);
      node.style.setProperty("--tilt-y", `${currentX.toFixed(3)}deg`);
      node.style.setProperty("--tilt-scale", `${scale}`);

      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      targetX = (x - 0.5) * max * 2;
      targetY = -(y - 0.5) * max * 2;
      node.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`);
      node.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`);
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      node.style.setProperty("--shine-x", "50%");
      node.style.setProperty("--shine-y", "50%");
      if (!raf) raf = requestAnimationFrame(render);
    };

    node.style.setProperty("--tilt-perspective", `${perspective}px`);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max, perspective, scale]);

  return ref;
}
