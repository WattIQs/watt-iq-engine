import { useEffect, useState } from "react";

/**
 * Retorna o progresso vertical da página entre 0 e 1.
 *
 * O cálculo é sincronizado com requestAnimationFrame
 * para evitar atualizações excessivas durante o scroll.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const doc = document.documentElement;

      const scrollable =
        doc.scrollHeight - doc.clientHeight;

      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const next = Math.min(
        Math.max(window.scrollY / scrollable, 0),
        1,
      );

      setProgress(next);
    };

    const requestUpdate = () => {
      if (raf) return;

      raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      requestUpdate,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        requestUpdate,
      );

      window.removeEventListener(
        "resize",
        requestUpdate,
      );

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return progress;
}

/**
 * Parallax extremamente suave.
 *
 * Não altera o layout e usa requestAnimationFrame
 * para manter o movimento estável.
 */
export function useParallax(
  factor = 0.05,
) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      setOffset(0);
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;

      setOffset(
        window.scrollY * factor,
      );
    };

    const requestUpdate = () => {
      if (raf) return;

      raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        requestUpdate,
      );

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [factor]);

  return offset;
}
