import { Reveal, SectionHeading } from "./primitives";

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
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gaps.map((g, i) => (
            <Reveal key={g.t} delay={i * 80}>
              <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50">
                <p className="text-xs tracking-widest text-primary uppercase">{g.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{g.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContextSection() {
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
          {[
            {
              n: "+30%",
              d: "do consumo final de energia está relacionado à indústria brasileira.",
            },
            {
              n: "~40%",
              d: "da eletricidade consumida no Brasil está relacionada à indústria.",
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="h-full rounded-lg border border-border bg-card p-8">
                <p className="text-5xl font-semibold text-gradient-energy">{s.n}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
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
            <Reveal key={c} delay={i * 60}>
              <span className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium">
                {c}
              </span>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mx-auto mt-14 max-w-3xl rounded-lg border border-primary/30 bg-card p-8 text-center">
            <p className="text-lg leading-relaxed">
              Não existe um <strong>consumo ideal universal</strong>. Eficiência energética só faz
              sentido dentro do contexto da empresa: ramo, porte, funcionários, área, horário de
              funcionamento, equipamentos, setores e histórico.
            </p>
          </div>
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
        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 70}>
              <div className="group h-full rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50">
                <span className="text-sm font-mono text-primary">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                <div className="mt-5 h-px w-full overflow-hidden bg-border">
                  <div className="h-full w-0 bg-gradient-energy transition-all duration-500 group-hover:w-full" />
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
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
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 3) * 80}>
              <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50">
                <h3 className="text-base font-semibold text-primary">{it.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
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
          <Reveal>
            <ol className="space-y-3">
              {["Dados", "Análise", "Gemini", "Insight"].map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4"
                >
                  <span className="text-xs font-mono text-primary">0{i + 1}</span>
                  <span className="font-medium">{s}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-lg border border-primary/30 bg-card p-7">
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
            </div>
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
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {views.map((v, i) => (
            <Reveal key={v} delay={(i % 4) * 70}>
              <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm font-medium transition-colors hover:border-primary/50">
                {v}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={150}>
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
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
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[300px] w-[720px] -translate-y-1/2 rounded-full opacity-20 blur-3xl"
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
            className="lift glow-energy mt-9 inline-block rounded-md bg-gradient-energy animate-gradient px-7 py-3 text-sm font-semibold text-primary-foreground hover:lift-hover"
          >
            Ver como acessar
          </a>
        </Reveal>
      </div>
    </section>
  );
}
