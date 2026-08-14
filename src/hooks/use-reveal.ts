import { useEffect, useRef, useState } from "react";

/**
 * Reveal progressivo baseado na entrada do elemento no viewport.
 *
 * Funciona de forma confiável em:
 * - desktop
 * - notebook
 * - mobile
 * - scroll normal
 * - scroll suave
 *
 * Também possui fallback através de scroll/resize para
 * navegadores onde o IntersectionObserver pode não disparar
 * corretamente durante mudanças de layout.
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

    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;

      revealed = true;
      setShown(true);

      observer?.unobserve(node);
    };

    const checkVisibility = () => {
      if (revealed) return;

      const rect =
        node.getBoundingClientRect();

      const viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight;

      const viewportWidth =
        window.innerWidth ||
        document.documentElement.clientWidth;

      const visible =
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top <
          viewportHeight * 0.95 &&
        rect.left <
          viewportWidth &&
        rect.bottom >
          viewportHeight * 0.02;

      if (visible) {
        reveal();
      }
    };

    const start = () => {
      /*
       * Primeiro fazemos uma verificação direta.
       * Isso resolve principalmente elementos que já estavam
       * dentro da tela quando o componente foi montado.
       */
      checkVisibility();

      if (revealed) return;

      observer =
        new IntersectionObserver(
          (entries) => {
            const entry = entries[0];

            if (!entry) return;

            if (
              entry.isIntersecting ||
              entry.intersectionRatio > 0
            ) {
              reveal();
            }
          },
          {
            threshold: [
              0,
              0.01,
              0.05,
              0.1,
            ],

            rootMargin:
              "0px 0px -5% 0px",
          },
        );

      observer.observe(node);

      /*
       * Fallback para desktop.
       */
      window.addEventListener(
        "scroll",
        checkVisibility,
        {
          passive: true,
        },
      );

      window.addEventListener(
        "resize",
        checkVisibility,
        {
          passive: true,
        },
      );

      /*
       * Mais uma verificação depois do layout estabilizar.
       */
      frame = requestAnimationFrame(
        () => {
          checkVisibility();

          frame =
            requestAnimationFrame(
              checkVisibility,
            );
        },
      );
    };

    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(start);
    });

    return () => {
      cancelAnimationFrame(frame);

      observer?.disconnect();

      window.removeEventListener(
        "scroll",
        checkVisibility,
      );

      window.removeEventListener(
        "resize",
        checkVisibility,
      );
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
        1 -
        Math.pow(
          1 - progress,
          3,
        );

      setValue(target * eased);

      if (progress < 1) {
        raf =
          requestAnimationFrame(tick);
      } else {
        setValue(target);
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
