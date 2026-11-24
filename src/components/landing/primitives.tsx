import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  useCountUp,
  useReveal,
} from "@/hooks/use-reveal";

import { useTilt } from "@/hooks/use-tilt";

import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const { ref, shown } =
    useReveal<HTMLElement>();

  const style = {
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref as never}
      style={style}
      className={cn(
        "reveal",
        shown && "reveal-in",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function TiltCard({
  children,
  className,
  max = 4,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useTilt<HTMLDivElement>({
    max,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "tilt-card",
        className,
      )}
    >
      <div
        className="tilt-card-shine"
        aria-hidden
      />

      <div className="tilt-card-content">
        {children}
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" &&
          "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <span className="section-eyebrow">
          <span
            className="section-eyebrow-dot"
            aria-hidden
          />

          {eyebrow}
        </span>
      ) : null}

      <h2 className="mt-5 text-3xl leading-tight font-semibold text-balance sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function CountUp({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const { ref, value } =
    useCountUp(target);

  return (
    <span ref={ref}>
      {Math.round(value)}
      {suffix}
    </span>
  );
}

/**
 * Número que conta até o valor final ao entrar na tela.
 * Aceita textos como "560,2 TWh", "44,1%", "+14%" e "-1,2%".
 * Valores sem número no começo são exibidos como estão.
 */
export function CountValue({
  value,
  duration = 1600,
}: {
  value: string;
  duration?: number;
}) {
  const m = value.match(
    /^([+\-\u2212]?)(\d+(?:[.,]\d+)?)(.*)$/,
  );

  const sign = m?.[1] ?? "";
  const raw = m?.[2] ?? "";
  const tail = m?.[3] ?? "";
  const target = m ? Number(raw.replace(",", ".")) : 0;
  const decimals = raw.includes(",")
    ? (raw.split(",")[1]?.length ?? 0)
    : raw.includes(".")
      ? (raw.split(".")[1]?.length ?? 0)
      : 0;

  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(target);

  useEffect(() => {
    const node = ref.current;

    if (!node || !m) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    setN(0);

    let raf = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        io.disconnect();

        const t0 = performance.now();

        const tick = (now: number) => {
          const k = Math.min((now - t0) / duration, 1);

          setN(target * (1 - Math.pow(1 - k, 4)));

          if (k < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    io.observe(node);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!m) return <span>{value}</span>;

  return (
    <span ref={ref} className="tabular-nums">
      {sign}
      {n.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {tail}
    </span>
  );
}

/** Texto que acende palavra por palavra conforme a rolagem. */
export function ScrubText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = children.split(" ");

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    let raf = 0;

    const update = () => {
      raf = 0;

      const r = el.getBoundingClientRect();
      const v = window.innerHeight;
      const p = Math.min(
        1,
        Math.max(0, (v * 0.9 - r.top) / (v * 0.5)),
      );

      el.style.setProperty("--p", p.toFixed(3));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <p
      ref={ref}
      className={cn("frt-scrub", className)}
      style={{ ["--n" as string]: words.length } as CSSProperties}
    >
      {words.map((w, i) => (
        <span key={i} style={{ ["--i" as string]: i } as CSSProperties}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

/** Palavras que sobem em sequência (entrada do hero). */
export function RiseWords({
  text,
  from = 0,
  step = 70,
  className,
}: {
  text: string;
  from?: number;
  step?: number;
  className?: string;
}) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} className={cn("frt-w", className)}>
          <span style={{ animationDelay: `${(from + i) * step + 200}ms` }}>
            {w}
          </span>{" "}
        </span>
      ))}
    </>
  );
}
