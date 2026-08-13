import type { CSSProperties, ReactNode } from "react";
import { useCountUp, useReveal } from "@/hooks/use-reveal";
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
  const { ref, shown } = useReveal<HTMLElement>();
  const style = { "--reveal-delay": `${delay}ms`, transitionDelay: `${delay}ms` } as CSSProperties;

  return (
    <Tag
      ref={ref as never}
      style={style}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const mx = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
        const my = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
        event.currentTarget.style.setProperty("--mx", `${mx}%`);
        event.currentTarget.style.setProperty("--my", `${my}%`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--mx", "50%");
        event.currentTarget.style.setProperty("--my", "50%");
      }}
      className={cn("reveal", shown && "reveal-in", className)}
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
  const ref = useTilt<HTMLDivElement>({ max });
  return (
    <div ref={ref} className={cn("tilt-card", className)}>
      <div className="tilt-card-shine" aria-hidden />
      <div className="tilt-card-content">{children}</div>
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
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <span className="section-eyebrow">
          <span className="section-eyebrow-dot" aria-hidden />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-5 text-3xl leading-tight font-semibold text-balance sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
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
  const { ref, value } = useCountUp(target);
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}
