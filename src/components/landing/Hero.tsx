import { useEffect, useRef } from "react";

import { useParallax } from "@/hooks/use-scroll-progress";
import { RiseWords, TiltCard } from "./primitives";

const logo = "/wattiq-logo.png";

const bars = [38, 52, 44, 66, 58, 79, 71, 92];

export function Hero() {
  const ambient = useParallax(0.055);
  const panelOffset = useParallax(-0.025);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;

    if (!el) return;

    let raf = 0;

    const update = () => {
      raf = 0;

      const p = Math.min(1, Math.max(0, window.scrollY / el.offsetHeight));

      el.style.setProperty("--hero-p", p.toFixed(3));
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
    <section ref={sectionRef} className="frt-hero relative overflow-hidden border-b border-border">
      <div className="frt-hero-photo pointer-events-none absolute inset-0" aria-hidden>
        <img
          src="https://images.unsplash.com/photo-1786913508324-13b77bf4e299?auto=format&fit=crop&w=2400&h=1500&q=60"
          alt=""
          className="frt-drift h-full w-full object-cover"
          fetchPriority="high"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[320px] w-[620px] -translate-x-1/2 rounded-full opacity-[0.14] blur-3xl animate-energy-pulse"
        style={{ background: "var(--gradient-energy)", transform: `translate3d(-50%, ${ambient}px, 0)` }}
        aria-hidden
      />
      <div className="frt-hero-copy relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div className="animate-rise">
          <img
            src={logo}
            alt="WattIQ — sistema de monitoramento energético para empresas"
            className="h-32 w-auto object-contain sm:h-40"
            width={320}
            height={128}
          />
          <p className="frt-eyebrow mt-8">
            <i aria-hidden />
            Energia medida. Inteligência aplicada.
          </p>
          <h1 className="mt-5 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
            <RiseWords text="Transforme o consumo de energia da sua empresa em" />{" "}
            <span className="text-gradient-energy">
              <RiseWords text="inteligência" from={9} />
            </span>
            <span aria-hidden>.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A WattIQ monitora e analisa o consumo energético da sua operação, transforma dados em
            indicadores contextualizados e usa inteligência artificial para interpretar padrões,
            variações e oportunidades de eficiência.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#cta"
              className="rounded-md bg-gradient-energy px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 glow-energy"
            >
              Acessar plataforma
            </a>
            <a
              href="#como-funciona"
              className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Como funciona
            </a>
          </div>
          <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs tracking-widest text-muted-foreground uppercase">
            {["Consumo", "Dados", "Análise", "Inteligência", "Decisão"].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                {i > 0 && <span className="text-primary/60" aria-hidden>→</span>}
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="animate-rise [animation-delay:150ms]" style={{ transform: `translate3d(0, ${panelOffset}px, 0)` }}>
          <HeroPanel />
        </div>
      </div>
    </section>
  );
}

function HeroPanel() {
  return (
    <TiltCard className="rounded-2xl" max={3}>
      <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Exemplo ilustrativo de visualização</p>
        <span className="rounded border border-border px-2 py-0.5 text-[10px] tracking-widest text-muted-foreground uppercase">
          Demonstração
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Consumo", value: "kWh" },
          { label: "Custo", value: "R$" },
          { label: "CO₂ estimado", value: "kg" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-background/60 p-3">
            <p className="text-[11px] text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-sm font-semibold text-primary">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex h-44 items-end gap-2 rounded-lg border border-border bg-background/60 p-4">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gradient-energy"
            style={{
              height: `${h}%`,
              animation: `wattiq-rise 0.8s cubic-bezier(.22,1,.36,1) ${i * 70}ms both`,
            }}
          />
        ))}
      </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Esta visualização é meramente ilustrativa. No produto, gráficos são gerados apenas a partir
          dos dados reais informados pela empresa.
        </p>
      </div>
    </TiltCard>
  );
}
