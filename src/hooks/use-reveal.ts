import { useEffect, useRef, useState } from "react";

/**
 * Reveal progressivo baseado na entrada do elemento no viewport.
 *
 * Funciona tanto em desktop quanto em mobile.
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
export function useReveal<
  T extends HTMLElement = HTMLDivElement,
>() {
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

    /*
     * Em alguns desktops o IntersectionObserver pode
     * executar antes de o layout estar completamente
     * estabilizado.
     *
     * Esperamos um frame antes de observar o elemento.
     */
    let observer: IntersectionObserver | null = null;
    let frame = 0;

    const startObserver = () => {
      /*
       * Se o elemento já estiver visível quando o observer
       * for criado, também queremos revelar.
       */
      const rect = node.getBoundingClientRect();

      const viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight;

      const alreadyVisible =
        rect.top < viewportHeight &&
        rect.bottom > 0;

      if (alreadyVisible) {
        setShown(true);
        return;
      }

      observer =
        new IntersectionObserver(
          (entries) => {
            const entry = entries[0];

            if (!entry) return;

            if (
              entry.isIntersecting ||
              entry.intersectionRatio > 0
            ) {
              setShown(true);

              observer?.unobserve(node);
            }
          },
          {
            /*
             * Um threshold pequeno funciona melhor
             * para elementos grandes e pequenos.
             */
            threshold: 0.01,

            /*
             * O elemento começa a animar um pouco
             * antes de entrar completamente na tela.
             */
            rootMargin:
              "0px 0px -5% 0px",
          },
        );

      observer.observe(node);
    };

    /*
     * Dois frames ajudam a evitar problemas de layout
     * principalmente em navegadores desktop.
     */
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(
        startObserver,
      );
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
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

      const eased =
        1 - Math.pow(1 - progress, 3);

      setValue(target * eased);

      if (progress < 1) {
        raf =
          requestAnimationFrame(
            tick,
          );
      }
    };

    raf =
      requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [
    shown,
    target,
    duration,
  ]);

  return {
    ref,
    value,
  };
}

function useCountRef() {
  return useReveal<HTMLSpanElement>();
}
