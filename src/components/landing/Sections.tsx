import { Reveal, SectionHeading } from "./primitives";

export function ProblemSection() {
  const gaps = [
    {
      t: "Onde",
      d: "Identifique quais setores, processos ou equipamentos concentram o consumo registrado.",
    },
    {
      t: "Quando",
      d: "Compare horários e períodos para localizar mudanças relevantes no comportamento energético.",
    },
    {
      t: "Como",
      d: "Relacione consumo, operação, equipamentos e rotina para entender o comportamento da demanda.",
    },
    {
      t: "Por que",
      d: "Investigue variações entre períodos comparáveis com base nos dados disponíveis.",
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
                Sua empresa sabe quanto consome.{" "}
                <span className="text-gradient-energy">
                  Mas consegue explicar esse consumo?
                </span>
              </>
            }
            description="Conhecer o valor da fatura é apenas o ponto de partida. A gestão energética exige visibilidade sobre variações, períodos, setores, equipamentos e contexto operacional."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gaps.map((g, i) => (
            <Reveal key={g.t} delay={i * 80}>
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6">
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
                Energia também é uma variável{" "}
                <span className="text-gradient-energy">
                  operacional.
                </span>
              </>
            }
            description="Os dados abaixo são referências públicas do mercado brasileiro. Eles não representam clientes, resultados ou métricas internas da WattIQ."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketData.map((item, i) => (
            <Reveal
              key={item.value + item.label}
              delay={i * 80}
            >
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6">
                <p className="text-4xl font-semibold tracking-tight text-gradient-energy">
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
          <div className="mt-8 rounded-lg border border-border bg-card/40 p-5">
            <p className="text-sm font-medium">
              Referências de mercado, não resultados da WattIQ.
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Os indicadores públicos são apresentados apenas para
              contextualizar o mercado. As análises da plataforma devem
              utilizar os dados efetivamente fornecidos pela empresa.
            </p>
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
    <section
      id="solucao"
      className="border-b border-border py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="A solução"
            title="Conheça a WattIQ."
            description="Uma plataforma para organizar dados energéticos, acompanhar indicadores e transformar medições em contexto para decisões operacionais."
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
              <strong>consumo ideal universal</strong>.
              Eficiência precisa ser avaliada dentro do
              contexto da operação: atividade, porte, área,
              horários, equipamentos, setores e histórico.
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
      d: "Registre os dados energéticos disponíveis da operação.",
    },
    {
      n: "02",
      t: "Organize",
      d: "Estruture informações sobre a empresa e seu contexto operacional.",
    },
    {
      n: "03",
      t: "Monitore",
      d: "Acompanhe indicadores e sua evolução ao longo dos períodos.",
    },
    {
      n: "04",
      t: "Analise",
      d: "Compare períodos, variações, setores e padrões identificados.",
    },
    {
      n: "05",
      t: "Interprete",
      d: "Use inteligência artificial para transformar resultados em uma leitura compreensível.",
    },
    {
      n: "06",
      t: "Decida",
      d: "Priorize investigações e ações com base nas informações disponíveis.",
    },
  ];

  return (
    <section
      id="como-funciona"
      className="border-b border-border py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Como funciona"
            title="Do dado bruto à decisão"
            description="Cada etapa possui uma função clara: coletar, estruturar, calcular, analisar e interpretar."
          />
        </Reveal>

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal
              as="li"
              key={s.n}
              delay={i * 70}
            >
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6">
                <span className="text-sm font-mono text-primary">
                  {s.n}
                </span>

                <h3 className="mt-3 text-lg font-semibold">
                  {s.t}
                </h3>

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
      d: "Consumo total registrado no período analisado.",
    },
    {
      t: "Custo",
      d: "Custo energético calculado a partir dos dados disponíveis.",
    },
    {
      t: "kWh / funcionário",
      d: "Indicador relativo ao número de colaboradores informado.",
    },
    {
      t: "kWh / m²",
      d: "Indicador relativo à área ocupada pela operação.",
    },
    {
      t: "Equipamentos",
      d: "Distribuição do consumo entre equipamentos cadastrados.",
    },
    {
      t: "Setores",
      d: "Distribuição do consumo entre setores da empresa.",
    },
    {
      t: "Variação",
      d: "Diferença percentual entre períodos comparáveis.",
    },
    {
      t: "CO₂ estimado",
      d: "Estimativa calculada conforme o fator de emissão adotado.",
    },
    {
      t: "Eficiência",
      d: "Evolução dos indicadores dentro do contexto operacional.",
    },
  ];

  return (
    <section
      id="indicadores"
      className="border-b border-border py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Indicadores"
            title="Números precisam de contexto."
            description="A plataforma não trata um indicador isolado como uma conclusão. Cada métrica precisa ser interpretada considerando os dados e o perfil da operação."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal
              key={it.t}
              delay={(i % 3) * 80}
            >
              <div className="surface-card group h-full rounded-lg border border-border bg-card p-6">
                <h3 className="text-base font-semibold text-primary">
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
      d: "Medições e informações fornecidas pela empresa.",
    },
    {
      n: "02",
      t: "Cálculo",
      d: "Indicadores calculados pela aplicação.",
    },
    {
      n: "03",
      t: "Análise",
      d: "Comparações, variações e padrões identificáveis.",
    },
    {
      n: "04",
      t: "IA",
      d: "Interpretação dos resultados disponíveis.",
    },
    {
      n: "05",
      t: "Insight",
      d: "Uma leitura clara para apoiar a investigação.",
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
            description="Os cálculos permanecem determinísticos. A inteligência artificial recebe os resultados disponíveis e ajuda a transformá-los em uma leitura mais clara."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            {pipeline.map((item, i) => (
              <Reveal
                key={item.n}
                delay={i * 70}
              >
                <div className="surface-card group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_40px_-25px_rgba(180,255,80,0.4)]">
                  <span className="text-xs font-mono text-primary">
                    {item.n}
                  </span>

                  <div>
                    <span className="font-medium">
                      {item.t}
                    </span>

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
                Exemplo ilustrativo
              </span>

              <p className="mt-5 text-lg leading-relaxed">
                O consumo aumentou{" "}
                <strong>14%</strong> em relação ao
                período anterior.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-background/40 p-4">
                  <p className="text-xs text-muted-foreground">
                    Variação
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-gradient-energy">
                    +14%
                  </p>
                </div>

                <div className="rounded-md border border-border bg-background/40 p-4">
                  <p className="text-xs text-muted-foreground">
                    Próximo passo
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    Investigar
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Exemplo conceitual de como a plataforma pode
                apresentar uma variação e direcionar a
                investigação. Os valores acima não são dados
                de clientes da WattIQ.
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
            description="Uma interface orientada a dados, construída para diferenciar métricas próprias da empresa de referências externas."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {views.map((v, i) => (
            <Reveal
              key={v}
              delay={(i % 4) * 70}
            >
              <div className="surface-card group rounded-lg border border-border bg-card px-5 py-4 text-sm font-medium">
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
                Sem dados suficientes, não existe análise
                confiável.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A WattIQ deve informar o que está disponível,
                indicar quais dados ainda precisam ser
                coletados e evitar preencher o dashboard com
                números artificiais.
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
                Referências públicas ajudam a contextualizar
                o cenário energético.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/40 p-5">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Empresa
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                Dados próprios alimentam indicadores
                específicos da operação.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/40 p-5">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Inteligência
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                A IA interpreta resultados calculados pela
                plataforma.
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
    <section
      id="cta"
      className="relative overflow-hidden py-28"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[300px] w-[720px] -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "var(--gradient-energy)",
        }}
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
            Transforme dados energéticos em uma visão mais
            clara da operação — sem confundir referência de
            mercado com resultado da sua empresa.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
