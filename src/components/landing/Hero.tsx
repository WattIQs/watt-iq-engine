import { TiltCard } from "./primitives";
import { useParallax } from "@/hooks/use-scroll-progress";

const logo = "/wattiq-logo.png";

const bars = [38, 52, 44, 66, 58, 79, 71, 92];

export function Hero() {
  const orbOffset = useParallax(0.18);
  const orbOffsetSlow = useParallax(0.08);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[320px] w-[620px] -translate-x-1/2 rounded-full opacity-[0.12] blur-3xl animate-energy-pulse"
        style={{ background: "var(--gradient-energy)", transform: `translate(-50%, ${orbOffset}px)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-24 -right-24 h-64 w-64 rounded-full opacity-[0.14] blur-3xl animate-glow-breathe"
        style={{ background: "var(--gradient-energy)", transform: `translateY(${orbOffsetSlow}px)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-[6%] h-40 w-40 rounded-full opacity-[0.1] blur-2xl"
        style={{ background: "var(--gradient-energy)", transform: `translateY(${-orbOffsetSlow}px)` }}
        aria-hidden
      />

      {/* floating specks for depth */}
      <span
        className="pointer-events-none absolute top-28 left-[18%] h-1.5 w-1.5 rounded-full bg-primary/60 animate-drift"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute top-1/2 right-[12%] h-1 w-1 rounded-full bg-accent/70 animate-float [animation-delay:600ms]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-24 left-[38%] h-1 w-1 rounded-full bg-primary/50 animate-drift [animation-delay:1.2s]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
        <div className="animate-rise">
          <img
            src={logo}
            alt="WattIQ — sistema de monitoramento energético para empresas"
            className="h-32 w-auto object-contain sm:h-40"
            width={320}
            height={128}
          />
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-widest text-primary uppercase">
            Energia medida. Inteligência aplicada.
          </p>
          <h1 className="mt-5 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
            Transforme o consumo de energia da sua empresa em{" "}
            <span className="text-gradient-energy">inteligência</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A WattIQ monitora e analisa o consumo energético da sua operação, transforma dados em
            indicadores contextualizados e usa inteligência artificial para interpretar padrões,
            variações e oportunidades de eficiência.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#cta"
              className="cta-ring shine-hover rounded-md bg-gradient-energy px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 glow-energy"
            >
              Acessar plataforma
            </a>
            <a
              href="#como-funciona"
              className="underline-grow rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Como funciona
            </a>
          </div>
          <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs tracking-widest text-muted-foreground uppercase">
            {["Consumo", "Dados", "Análise", "Inteligência", "Decisão"].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-primary/60 animate-pulse" aria-hidden>
                    →
                  </span>
                )}
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="animate-rise [animation-delay:150ms]">
          <HeroPanel />
        </div>
      </div>
    </section>
  );
}

function HeroPanel() {
  return (
    <TiltCard
      strength={6}
      className="rounded-xl border border-border bg-card p-5 shadow-2xl shadow-black/40"
    >
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
          <div
            key={k.label}
            className="rounded-lg border border-border bg-background/60 p-3 transition-colors hover:border-primary/40"
          >
            <p className="text-[11px] text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-sm font-semibold text-primary">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex h-44 items-end gap-2 rounded-lg border border-border bg-background/60 p-4">
        {bars.map((h, i) => (
          <div
            key={i}
            className="group/bar relative flex-1 cursor-default overflow-hidden rounded-sm bg-gradient-energy transition-[filter] duration-300 hover:brightness-110"
            style={{
              height: `${h}%`,
              animation: `wattiq-rise 0.8s cubic-bezier(.22,1,.36,1) ${i * 70}ms both`,
            }}
          >
            <span className="pointer-events-none absolute inset-0 -translate-y-full bg-white/25 opacity-0 transition-all duration-300 group-hover/bar:translate-y-0 group-hover/bar:opacity-100" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Esta visualização é meramente ilustrativa. No produto, gráficos são gerados apenas a partir
        dos dados reais informados pela empresa.
      </p>
    </TiltCard>
  );
}
