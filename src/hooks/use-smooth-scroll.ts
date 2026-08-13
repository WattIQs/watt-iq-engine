import { useEffect } from "react";

export function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const link = target.closest(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      /*
       * Não interfere em links que tenham
       * comportamento especial.
       */
      if (
        link.hasAttribute("download") ||
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const element =
        document.querySelector(href);

      if (!element) return;

      event.preventDefault();

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

      if (reducedMotion) {
        element.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      } else {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      /*
       * Atualiza a URL sem recarregar a página.
       */
      window.history.pushState(
        null,
        "",
        href,
      );
    };

    document.addEventListener(
      "click",
      handleClick,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
      );
    };
  }, []);
}
