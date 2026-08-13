import { useEffect } from "react";

export function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const link = target.closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

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

      const element = document.querySelector(href);

      if (!element) return;

      event.preventDefault();

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      element.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });

      window.history.pushState(null, "", href);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);
}
