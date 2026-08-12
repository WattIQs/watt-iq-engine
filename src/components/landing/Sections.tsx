import { useEffect, useState } from "react";
import { Reveal, SectionHeading, TiltCard, CardCarousel } from "./primitives";
import { useReveal } from "@/hooks/use-reveal";

export function ProblemSection() {
  const gaps = [
    { t: "Onde", d: "Qual setor, processo ou equipamento concentra o consumo." },
    { t: "Quando", d: "Em quais horários e períodos o consumo cresce." },
    { t: "Como", d: "De que forma a operação influencia a curva de consumo." },
    { t: "Por que", d: "O que explica variações entre um período e outro." },
  ];
  return (
    <section id="problema" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="O problema"
            title={
              <>
                Sua empresa sabe quanto gasta.{" "}
                <span className="text-gradient-energy">Mas sabe onde está consumindo?</span>
              </>
            }
            description="O problema não é apenas consumir energia. É não ter visibilidade suficiente para entender o consumo — o que dificulta identificar desperdícios, comparar períodos, detectar variações e priorizar ações de economia."
          />
        </Reveal>
        <Reveal delay={120} className="mt-14">
          <CardCarousel
            items={gaps}
            getKey={(g) => g.t}
            itemClassName="basis-[85%] sm:basis-1/2 lg:basis-1/4"
            renderItem={(g) => (
              <TiltCard className="h-full rounded-lg border border-border bg-card p-6">
                <p className="text-xs tracking-widest text-primary uppercase">{g.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{g.d}</p>
              </TiltCard>
            )}
          />
        </Reveal>
      </div>
    </section>
  );
}

/** Animated "counts up" numeric stat, e.g. prefix="+" value={30} suffix="%". */
function StatNumber({ prefix = "", value, suffix = "" }: { prefix?: string; value: number; suffix?: string }) {
  const { ref, shown } = useReveal<HTMLSpanElement>();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!shown) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, value]);

  return (
    <span ref={ref} className="text-5xl font-semibold text-gradient-energy tabular-nums">
      {prefix}
      {Math.round(display)}
      {suffix}
    </span>
  );
}

export function ContextSection() {
  const stats = [
    {
      prefix: "+",
      value: 30,
      suffix: "%",
      d: "do consumo final de energia está relacionado à indústria brasileira.",
    },
    {
      prefix: "~",
      value: 40,
      suffix: "%",
      d: "da eletricidade consumida no Brasil está relacionada à indústria.",
    },
  ];
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Por que isso importa?"
            title="A energia é um custo estrutural da operação industrial"
            description="A avaliação de ações de eficiência energética é destacada pela EPE, que identifica equipamentos como motores, bombas e compressores entre os elementos relevantes para a demanda energética industrial."
          />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {stats.map((s, i) => (
            <Reveal key={s.d} delay={i * 100} variant={i % 2 === 0 ? "left" : "right"}>
              <TiltCard className="h-full rounded-lg border border-border bg-card p-8">
                <StatNumber prefix={s.prefix} value={s.value} suffix={s.suffix} />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={150}>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Fontes: EPE (Empresa de Pesquisa Energética) e Procel. Segundo o Procel, sistemas
            motrizes — motores, bombas, compressores e ventiladores — representam parcela
            significativa do consumo elétrico industrial e apresentam oportunidades relevantes de
            eficiência energética.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function SolutionSection() {
  const chain = ["Organiza", "Monitora", "Calcula", "Analisa", "Contextualiza", "Interpreta"];
  return (
    <section id="solucao" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="A solução"
            title="Conheça a WattIQ."
            description="A WattIQ monitora e analisa o consumo energético de cada empresa, transforma dados em indicadores e utiliza inteligência artificial para gerar insights que ajudam a identificar padrões, oportunidades de economia e possíveis problemas de eficiência."
          />
        </Reveal>
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {chain.map((c, i) => (
            <Reveal key={c} delay={i * 60} variant="scale">
              <span className="shine-hover inline-block rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_14px_30px_-18px_oklch(0.72_0.19_145/0.55)]">
                {c}
              </span>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <TiltCard
            strength={4}
            className="mx-auto mt-14 max-w-3xl rounded-lg border border-primary/30 bg-card p-8 text-center"
          >
            <p className="text-lg leading-relaxed">
              Não existe um <strong>consumo ideal universal</strong>. Eficiência energética só faz
              sentido dentro do contexto da empresa: ramo, porte, funcionários, área, horário de
              funcionamento, equipamentos, setores e histórico.
            </p>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

export function HowSection() {
  const steps = [
    { n: "01", t: "Colete", d: "Dados energéticos da operação." },
    { n: "02", t: "Organize", d: "Informações e perfil da empresa." },
    { n: "03", t: "Monitore", d: "Indicadores acompanhados por período." },
    { n: "04", t: "Analise", d: "Variações, comparações e padrões." },
    { n: "05", t: "Interprete", d: "Inteligência artificial sobre os indicadores." },
    { n: "06", t: "Decida", d: "Ações mais informadas e priorizadas." },
  ];
  return (
    <section id="como-funciona" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading eyebrow="Como funciona" title="Do dado bruto à decisão" />
        </Reveal>
        <Reveal delay={120} className="mt-14">
          <CardCarousel
            items={steps}
            getKey={(s) => s.n}
            itemClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3"
            renderItem={(s) => (
              <TiltCard className="group h-full rounded-lg border border-border bg-card p-6">
                <span className="text-sm font-mono text-primary">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                <div className="mt-5 h-px w-full overflow-hidden bg-border">
                  <div className="h-full w-0 bg-gradient-energy transition-all duration-500 group-hover:w-full" />
                </div>
              </TiltCard>
            )}
          />
        </Reveal>
      </div>
    </section>
  );
}

export function IndicatorsSection() {
  const items = [
    { t: "kWh", d: "Consumo total de energia no período analisado." },
    { t: "Custo", d: "Custo energético associado ao consumo registrado." },
    { t: "kWh / funcionário", d: "Consumo relativo ao número de colaboradores." },
    { t: "kWh / m²", d: "Consumo relativo à área ocupada pela operação." },
    { t: "Equipamentos", d: "Consumo distribuído entre os equipamentos cadastrados." },
    { t: "Setores", d: "Consumo distribuído entre os setores da empresa." },
    { t: "Variação", d: "Diferença percentual entre períodos comparáveis." },
    { t: "CO₂ estimado", d: "Emissão estimada a partir do consumo registrado." },
    { t: "Eficiência", d: "Evolução dos indicadores dentro do contexto da empresa." },
  ];
  return (
    <section id="indicadores" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Indicadores"
            title="Todo número acompanhado de contexto"
            description="Um indicador isolado não diz muita coisa. A WattIQ apresenta cada métrica junto do que ela significa para o perfil da sua empresa."
          />
        </Reveal>
        <Reveal delay={120} className="mt-14">
          <CardCarousel
            items={items}
            getKey={(it) => it.t}
            itemClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3"
            renderItem={(it) => (
              <TiltCard className="h-full rounded-lg border border-border bg-card p-6">
                <h3 className="text-base font-semibold text-primary">{it.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.d}</p>
              </TiltCard>
            )}
          />
        </Reveal>
      </div>
    </section>
  );
}

export function IntelligenceSection() {
  return (
    <section id="intelligence" className="relative overflow-hidden border-b border-border py-24">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="WattIQ Intelligence"
            title={<span className="text-gradient-energy">A aplicação calcula. A IA interpreta.</span>}
            description="Os cálculos de consumo, custo, médias, variações e indicadores são feitos pela plataforma. A inteligência artificial recebe apenas esses resultados e os transforma em uma leitura compreensível — tendências, padrões, possíveis causas e oportunidades de investigação."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Reveal variant="left">
            <ol className="space-y-3">
              {["Dados", "Análise", "Gemini", "Insight"].map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-all duration-300 hover:-translate-x-1 hover:border-primary/40 hover:shadow-[0_10px_28px_-20px_oklch(0.72_0.19_145/0.6)]"
                >
                  <span className="text-xs font-mono text-primary">0{i + 1}</span>
                  <span className="font-medium">{s}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={120} variant="right">
            <TiltCard strength={5} className="h-full rounded-lg border border-primary/30 bg-card p-7">
              <span className="rounded border border-border px-2 py-0.5 text-[10px] tracking-widest text-muted-foreground uppercase">
                Exemplo ilustrativo
              </span>
              <p className="mt-5 text-lg leading-relaxed">
                “O consumo aumentou 14% em relação ao período anterior. O setor de produção foi
                responsável pela maior parte do aumento, principalmente pelo crescimento do consumo
                dos equipamentos de maior potência.”
              </p>
              <p className="mt-5 text-sm text-primary">
                A WattIQ identificou uma oportunidade de investigação no setor de produção.
              </p>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Exemplo conceitual para demonstrar o funcionamento da plataforma — não representa
                dados reais. Quando não houver dados suficientes, a WattIQ informa isso
                explicitamente em vez de estimar resultados.
              </p>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function DashboardSection() {
  const views = [
    "Visão geral",
    "Consumo",
    "Indicadores",
    "Setores",
    "Equipamentos",
    "Alertas",
    "WattIQ Intelligence",
    "Empresa",
  ];
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Dashboard"
            title="O núcleo da plataforma"
            description="Uma interface orientada a dados, com estados vazios honestos: enquanto não houver dados suficientes, a WattIQ explica o que falta em vez de preencher a tela com números fictícios."
          />
        </Reveal>
        <Reveal delay={120} className="mt-14">
          <CardCarousel
            items={views}
            getKey={(v) => v}
            itemClassName="basis-[70%] sm:basis-1/3 lg:basis-1/4"
            renderItem={(v) => (
              <TiltCard className="rounded-lg border border-border bg-card px-5 py-4 text-sm font-medium">
                {v}
              </TiltCard>
            )}
          />
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card/50 p-10 text-center transition-colors hover:border-primary/40">
            <p className="text-sm font-medium">
              Ainda não existem dados suficientes para gerar esta análise.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Adicione dados de consumo para começar a acompanhar este indicador.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section id="cta" className="relative overflow-hidden py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[300px] w-[720px] -translate-y-1/2 rounded-full opacity-20 blur-3xl animate-glow-breathe"
        style={{ background: "var(--gradient-energy)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            Energia medida. <span className="text-gradient-energy">Inteligência aplicada.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            A WattIQ não responde apenas “quanto você consumiu?”. Ela ajuda a responder o que o seu
            consumo está dizendo sobre a sua empresa.
          </p>
          <a
            href="#acesso"
            className="lift glow-energy cta-ring shine-hover mt-9 inline-block rounded-md bg-gradient-energy animate-gradient px-7 py-3 text-sm font-semibold text-primary-foreground hover:lift-hover"
          >
            Ver como acessar
          </a>
        </Reveal>
      </div>
    </section>
  );
}
