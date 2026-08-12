import { type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { useTilt } from "@/hooks/use-tilt";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  /** Direction the element animates in from. */
  variant?: "up" | "left" | "right" | "scale";
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const base = variant === "up" ? "reveal" : `reveal-${variant}`;
  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(base, shown && "reveal-in", className)}
    >
      {children}
    </Tag>
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
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-widest text-primary uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-5 text-3xl leading-tight font-semibold text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

/** Fixed bar at the very top of the page that fills as the user scrolls. */
export function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div className="scroll-progress-track" aria-hidden>
      <div className="scroll-progress-bar" style={{ "--scroll-progress": progress } as never} />
    </div>
  );
}

/** Card with mouse-tracked 3D tilt + cursor-following spotlight glow. */
export function TiltCard({
  children,
  className,
  strength = 8,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const { ref, onMouseMove, onMouseLeave } = useTilt<HTMLDivElement>(strength);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("tilt-card", className)}
    >
      {children}
    </div>
  );
}

/**
 * Draggable carousel with glowing arrow controls and progress dots, built on
 * the project's existing embla-based <Carousel /> primitive. Auto-advances
 * gently and pauses whenever the pointer is over it or it's out of view.
 */
export function CardCarousel<T>({
  items,
  renderItem,
  itemClassName = "basis-full sm:basis-1/2 lg:basis-1/3",
  autoPlay = true,
  interval = 4200,
  className,
  getKey,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemClassName?: string;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  getKey?: (item: T, index: number) => string | number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setSelected(api.selectedScrollSnap());
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    setSnapCount(api.scrollSnapList().length);
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", () => {
      setSnapCount(api.scrollSnapList().length);
      onSelect();
    });
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || !autoPlay || paused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, interval);
    return () => window.clearInterval(id);
  }, [api, autoPlay, paused, interval]);

  return (
    <div
      ref={containerRef}
      className={cn("group/carousel", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="cursor-grab active:cursor-grabbing">
        <CarouselContent>
          {items.map((item, i) => (
            <CarouselItem key={getKey ? getKey(item, i) : i} className={itemClassName}>
              {renderItem(item, i)}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Anterior"
          className="carousel-arrow"
          disabled={!canPrev}
          onClick={() => api?.scrollPrev()}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para o slide ${i + 1}`}
              data-active={i === selected}
              className="carousel-dot"
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Próximo"
          className="carousel-arrow"
          disabled={!canNext}
          onClick={() => api?.scrollNext()}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
