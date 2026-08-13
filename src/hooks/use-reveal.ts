import { useEffect, useRef, useState } from "react";

/**
 * Reveal progressivo baseado na entrada do elemento no viewport.
 *
 * O elemento começa invisível e entra suavemente com:
 * - opacity
 * - translateY
 * - blur
 * - escala muito sutil
 *
 * Depois de revelado, permanece visível.
 *
 * Respeita prefers-reduced-motion.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) return;

        if (entry.isIntersecting) {
          setShown(true);

          // Depois que o elemento entrou, não precisamos
          // continuar observando.
          observer.unobserve(node);
        }
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    shown,
  };
}

/**
 * Conta progressivamente até um valor quando o elemento
 * entra no viewport.
 */
export function useCountUp(
  target: number,
  duration = 1600,
) {
  const { ref, shown } = useCountRef();

  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shown) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      setValue(target);
      return;
    }

    let raf = 0;

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(
        (now - start) / duration,
        1,
      );

      // Ease-out cúbico.
      const eased =
        1 - Math.pow(1 - progress, 3);

      setValue(target * eased);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [shown, target, duration]);

  return {
    ref,
    value,
  };
}

function useCountRef() {
  return useReveal<HTMLSpanElement>();
}
