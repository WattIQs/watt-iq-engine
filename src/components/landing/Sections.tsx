import { Reveal, SectionHeading } from "./primitives";

export function ProblemSection() {
  const gaps = [
    {
      t: "Onde",
      d: "Qual setor, processo ou equipamento concentra o consumo.",
    },
    {
      t: "Quando",
      d: "Em quais horários e períodos o consumo apresenta mudanças relevantes.",
    },
    {
      t: "Como",
      d: "Como a operação, os equipamentos e a rotina influenciam a curva de consumo.",
    },
    {
      t: "Por que",
      d: "Quais fatores podem explicar uma variação entre períodos comparáveis.",
    },
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
                <span className="text-gradient-energy">
                  Mas sabe onde está consumindo?
                </span>
              </>
            }
            description="O desafio não é apenas conhecer a conta de energia. É transformar consumo bruto em informação operacional: entender variações, comparar períodos, identificar pontos de atenção e priorizar investigações."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gaps.map((g, i) => (
            <Reveal key={g.t} delay={i * 80}>
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_50px_-28px_rgba(180,255,80,0.45)]">
                <p className="text-xs tracking-widest text-primary uppercase">
                  {g.t}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                  {g.d}
                </p>

                <div className="mt-6 h-px w-full overflow-hidden bg-border">
                  <div className="h-full w-0 bg-gradient-energy transition-all duration-700 ease-out group-hover:w-full" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContextSection() {
  const marketData = [
    {
      value: "560,2 TWh",
      label: "consumo nacional em 2024",
      detail: "Alta de 5,3% em relação a 2023.",
      source: "EPE · Resenha Mensal de dezembro de 2024",
    },
    {
      value: "48 TWh",
      label: "consumo industrial no 4º tri. de 2024",
      detail: "Avanço de 4,2% frente ao mesmo trimestre de 2023.",
      source: "EPE · Boletim Trimestral nº 20",
    },
    {
      value: "50,4 TWh",
      label: "consumo industrial no 3º tri. de 2025",
      detail: "Variação de -1,2% frente ao mesmo trimestre de 2024.",
      source: "EPE · Boletim Trimestral nº 23",
    },
    {
      value: "44,1%",
      label: "participação do mercado livre",
      detail: "Participação no consumo nacional no 1º tri. de 2026.",
      source: "EPE · Boletim Trimestral nº 25",
    },
  ];

  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Contexto de mercado"
            title={
              <>
                Energia é um indicador importante da operação.
              </>
            }
            description="Os números abaixo não representam clientes da WattIQ. São dados oficiais do mercado brasileiro usados como contexto para mostrar a escala e a dinâmica do consumo de eletricidade."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketData.map((item, i) => (
            <Reveal key={item.value + item.label} delay={i * 80}>
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_22px_60px_-30px_rgba(180,255,80,0.4)]">
                <p className="text-4xl font-semibold tracking-tight text-gradient-energy transition-transform duration-500 group-hover:scale-[1.02]">
                  {item.value}
                </p>

                <p className="mt-4 text-sm font-medium text-foreground">
                  {item.label}
                </p>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>

                <p className="mt-5 border-t border-border pt-4 text-[10px] leading-relaxed tracking-wide text-muted-foreground uppercase">
                  {item.source}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={180}>
          <div className="mt-8 flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                Dados de referência, não dados de clientes.
              </p>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                A WattIQ utiliza dados próprios da empresa para gerar análises
                individualizadas. Dados públicos servem apenas como contexto.
              </p>
            </div>

            <a
              href="https://www.epe.gov.br/pt/areas-de-atuacao/energia-eletrica/consumo-de-energia-eletrica"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-medium text-primary transition-colors hover:text-foreground"
            >
              Ver dados da EPE ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SolutionSection() {
  const chain = [
    "Organiza",
    "Monitora",
    "Calcula",
    "Analisa",
    "Contextualiza",
    "Interpreta",
  ];

  return (
    <section id="solucao" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="A solução"
            title="Conheça a WattIQ."
            description="A WattIQ organiza dados energéticos, transforma medições em indicadores e utiliza inteligência artificial para ajudar a interpretar padrões, variações e oportunidades de investigação."
          />
        </Reveal>

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {chain.map((c, i) => (
            <Reveal key={c} delay={i * 60}>
              <span className="group inline-flex rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_12px_30px_-20px_rgba(180,255,80,0.5)]">
                {c}
              </span>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="surface-card mx-auto mt-14 max-w-3xl rounded-lg border border-primary/30 bg-card p-8 text-center">
            <p className="text-lg leading-relaxed">
              Não existe um{" "}
              <strong>consumo ideal universal</strong>. Eficiência energética
              precisa ser analisada dentro do contexto da empresa: atividade,
              porte, área, horários, equipamentos, setores e histórico.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HowSection() {
  const steps = [
    {
      n: "01",
      t: "Colete",
      d: "Dados energéticos da operação.",
    },
    {
      n: "02",
      t: "Organize",
      d: "Informações e perfil da empresa.",
    },
    {
      n: "03",
      t: "Monitore",
      d: "Indicadores acompanhados por período.",
    },
    {
      n: "04",
      t: "Analise",
      d: "Variações, comparações e padrões.",
    },
    {
      n: "05",
      t: "Interprete",
      d: "Inteligência artificial aplicada aos indicadores.",
    },
    {
      n: "06",
      t: "Decida",
      d: "Ações mais informadas e priorizadas.",
    },
  ];

  return (
    <section id="como-funciona" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Como funciona"
            title="Do dado bruto à decisão"
            description="A plataforma separa cálculo, análise e interpretação para que cada etapa tenha uma função clara."
          />
        </Reveal>

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 70}>
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_50px_-30px_rgba(180,255,80,0.45)]">
                <span className="text-sm font-mono text-primary">
                  {s.n}
                </span>

                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.d}
                </p>

                <div className="mt-5 h-px w-full overflow-hidden bg-border">
                  <div className="h-full w-0 bg-gradient-energy transition-all duration-700 ease-out group-hover:w-full" />
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
    {
      t: "kWh",
      d: "Consumo total de energia no período analisado.",
    },
    {
      t: "Custo",
      d: "Custo energético associado ao consumo registrado.",
    },
    {
      t: "kWh / funcionário",
      d: "Consumo relativo ao número de colaboradores.",
    },
    {
      t: "kWh / m²",
      d: "Consumo relativo à área ocupada pela operação.",
    },
    {
      t: "Equipamentos",
      d: "Consumo distribuído entre os equipamentos cadastrados.",
    },
    {
      t: "Setores",
      d: "Consumo distribuído entre os setores da empresa.",
    },
    {
      t: "Variação",
      d: "Diferença percentual entre períodos comparáveis.",
    },
    {
      t: "CO₂ estimado",
      d: "Emissão estimada a partir do consumo registrado e do fator adotado.",
    },
    {
      t: "Eficiência",
      d: "Evolução dos indicadores dentro do contexto da empresa.",
    },
  ];

  return (
    <section id="indicadores" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Indicadores"
            title="Todo número acompanhado de contexto"
            description="Um indicador isolado não diz muita coisa. A WattIQ apresenta cada métrica junto do que ela significa para o perfil da empresa."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 3) * 80}>
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_50px_-28px_rgba(180,255,80,0.4)]">
                <h3 className="text-base font-semibold text-primary transition-transform duration-300 group-hover:translate-x-0.5">
                  {it.t}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {it.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IntelligenceSection() {
  const pipeline = [
    {
      n: "01",
      t: "Dados",
      d: "Medições e informações da empresa.",
    },
    {
      n: "02",
      t: "Cálculo",
      d: "Indicadores calculados de forma determinística.",
    },
    {
      n: "03",
      t: "Análise",
      d: "Comparações, variações e padrões.",
    },
    {
      n: "04",
      t: "IA",
      d: "Interpretação dos resultados.",
    },
    {
      n: "05",
      t: "Insight",
      d: "Leitura clara para apoiar a investigação.",
    },
  ];

  return (
    <section
      id="intelligence"
      className="relative overflow-hidden border-b border-border py-24"
    >
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="WattIQ Intelligence"
            title={
              <span className="text-gradient-energy">
                A aplicação calcula. A IA interpreta.
              </span>
            }
            description="Os cálculos de consumo, custo, médias, variações e indicadores são realizados pela plataforma. A inteligência artificial recebe esses resultados e ajuda a transformá-los em uma leitura compreensível."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            {pipeline.map((item, i) => (
              <Reveal key={item.n} delay={i * 70}>
                <div className="surface-card group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_40px_-25px_rgba(180,255,80,0.4)]">
                  <span className="text-xs font-mono text-primary">
                    {item.n}
                  </span>

                  <div>
                    <span className="font-medium">{item.t}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.d}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={180}>
            <div className="surface-card h-full rounded-lg border border-primary/30 bg-card p-7">
              <span className="rounded border border-border px-2 py-0.5 text-[10px] tracking-widest text-muted-foreground uppercase">
                Exemplo baseado em dado público
              </span>

              <p className="mt-5 text-lg leading-relaxed">
                A EPE registrou{" "}
                <strong>50,4 TWh de consumo industrial</strong> no Brasil no
                terceiro trimestre de 2025, uma variação de{" "}
                <strong>-1,2%</strong> em relação ao mesmo trimestre de 2024.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-background/40 p-4">
                  <p className="text-xs text-muted-foreground">
                    Consumo industrial
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-gradient-energy">
                    50,4 TWh
                  </p>
                </div>

                <div className="rounded-md border border-border bg-background/40 p-4">
                  <p className="text-xs text-muted-foreground">
                    Variação anual
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    -1,2%
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Este exemplo utiliza dados públicos da EPE para demonstrar o
                tipo de contexto que uma análise pode apresentar. Não é um
                resultado de cliente da WattIQ.
              </p>

              <a
                href="https://www.epe.gov.br/pt/imprensa/noticias/epe-divulga-o-boletim-do-consumo-de-eletricidade-n-23-consumo-de-energia-eletrica-registrou-uma-leve-queda-de-0-3-no-3-trimestre-de-2025-puxado-pela-industria-e-pelo-comercio"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex text-xs font-medium text-primary transition-colors hover:text-foreground"
              >
                Fonte: EPE · Boletim nº 23 ↗
              </a>
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
            description="Uma interface orientada a dados, preparada para separar informações reais da empresa de referências externas de mercado."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {views.map((v, i) => (
            <Reveal key={v} delay={(i % 4) * 70}>
              <div className="surface-card group rounded-lg border border-border bg-card px-5 py-4 text-sm font-medium transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_40px_-25px_rgba(180,255,80,0.4)]">
                <div className="flex items-center justify-between gap-3">
                  <span>{v}</span>

                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 transition-all duration-500 group-hover:bg-primary group-hover:shadow-[0_0_12px_rgba(180,255,80,0.65)]" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="surface-card mt-8 rounded-lg border border-dashed border-border bg-card/50 p-10">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex rounded-full border border-border bg-background/50 px-3 py-1 text-[10px] tracking-widest text-muted-foreground uppercase">
                Dados da empresa
              </span>

              <p className="mt-5 text-lg font-medium">
                O dashboard só apresenta análises quando existem dados
                suficientes para sustentá-las.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Enquanto uma empresa ainda não possui histórico suficiente, a
                WattIQ não inventa consumo, economia ou eficiência. O sistema
                informa o que está disponível e o que precisa ser coletado.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card/40 p-5">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Mercado
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                Dados públicos podem contextualizar a operação.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/40 p-5">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Empresa
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                Dados próprios alimentam os indicadores personalizados.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/40 p-5">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Inteligência
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                A IA interpreta resultados calculados pela plataforma.
              </p>
            </div>
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
            Energia medida.{" "}
            <span className="text-gradient-energy">
              Inteligência aplicada.
            </span>
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            A WattIQ não responde apenas “quanto você consumiu?”. Ela ajuda a
            transformar dados energéticos em contexto para entender o que está
            acontecendo na operação.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
