import { useCallback, useEffect, useRef, useState } from "react";

import { Reveal, SectionHeading } from "./primitives";

const photo = (id: string, w = 1920, h = 1200, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;

type Slide = {
  id: string;
  area: string;
  title: string;
  text: string;
  stat: { value: string; label: string; source: string };
};

// Fotos: Unsplash (licença Unsplash). Números: referências públicas da EPE,
// as mesmas já citadas na seção de contexto de mercado. Nada aqui é resultado
// de clientes da WattIQ.
const slides: Slide[] = [
  {
    id: "1786913508324-13b77bf4e299",
    area: "Indústria",
    title: "Parques industriais com geração própria",
    text: "Galpões com painéis solares ainda precisam de medição: o que se gera e o que se consome são números diferentes.",
    stat: {
      value: "50,4 TWh",
      label: "consumo industrial no 3º tri. de 2025 (-1,2%)",
      source: "EPE · Boletim Trimestral nº 23",
    },
  },
  {
    id: "1581091212991-8891c7d4bd9b",
    area: "Equipamentos",
    title: "Cada máquina pesa na conta",
    text: "Linhas de produção concentram boa parte da demanda. Ver o consumo por equipamento mostra onde investigar primeiro.",
    stat: {
      value: "48 TWh",
      label: "consumo industrial no 4º tri. de 2024 (+4,2%)",
      source: "EPE · Boletim Trimestral nº 20",
    },
  },
  {
    id: "1684684383508-261dd0e8f467",
    area: "Medição",
    title: "Medidores que viram indicadores",
    text: "O dado começa no medidor. A WattIQ organiza as leituras para comparar períodos, setores e variações.",
    stat: {
      value: "kWh",
      label: "base de todo indicador calculado na plataforma",
      source: "Cálculo determinístico da aplicação",
    },
  },
  {
    id: "1509390221805-d1c887a72a00",
    area: "Mercado livre",
    title: "Quem escolhe o fornecedor precisa medir melhor",
    text: "No mercado livre a energia é negociada. Conhecer o próprio perfil de consumo dá base para essa decisão.",
    stat: {
      value: "44,1%",
      label: "participação do mercado livre no 1º tri. de 2026",
      source: "EPE · Boletim Trimestral nº 25",
    },
  },
  {
    id: "1728808668151-1ff0b42866a3",
    area: "Cenário nacional",
    title: "Um consumo que só cresce",
    text: "O Brasil consumiu mais energia em 2024 do que em 2023. Eficiência passa a ser vantagem operacional.",
    stat: {
      value: "560,2 TWh",
      label: "consumo nacional em 2024 (+5,3%)",
      source: "EPE · Resenha Mensal de dezembro de 2024",
    },
  },
  {
    id: "1758101755915-462eddc23f57",
    area: "Diagnóstico",
    title: "Do painel elétrico à leitura clara",
    text: "A aplicação calcula, a IA interpreta os resultados disponíveis e aponta onde olhar. A decisão continua sendo sua.",
    stat: {
      value: "Calcula + interpreta",
      label: "indicadores determinísticos, leitura por IA",
      source: "WattIQ Intelligence",
    },
  },
];

const DURATION = 6000;
const at = (i: number): Slide => slides[i] as Slide;

export function ShowcaseSection() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [dir, setDir] = useState(1);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const total = slides.length;

  const go = useCallback(
    (to: number, d?: number) => {
      const t = (to + total) % total;
      if (t === active) return;
      setPrev(active);
      setDir(d ?? (to > active ? 1 : -1));
      setActive(t);
    },
    [active, total],
  );

  const next = useCallback(() => go(active + 1, 1), [go, active]);
  const back = useCallback(() => go(active - 1, -1), [go, active]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(!!e?.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = thumbsRef.current?.children[active] as HTMLElement | undefined;
    const box = thumbsRef.current;
    if (t && box) {
      box.scrollTo({
        left: t.offsetLeft - box.clientWidth / 2 + t.offsetWidth / 2,
        behavior: "smooth",
      });
    }
    [(active + 1) % total, (active - 1 + total) % total].forEach((i) => {
      const im = new Image();
      im.src = photo(at(i).id);
    });
  }, [active, total]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (zoomed && !d.open) d.showModal();
    if (!zoomed && d.open) d.close();
  }, [zoomed]);

  const running = inView && !hover && !zoomed;
  const s = at(active);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      back();
    }
  };

  const img = (i: number, cls = "") =>
    broken[at(i).id] ? null : (
      <img
        className={cls}
        src={photo(at(i).id)}
        alt={i === active ? at(i).title : ""}
        width={1920}
        height={1200}
        draggable={false}
        onError={() =>
          setBroken((b) => ({ ...b, [at(i).id]: true }))
        }
      />
    );

  return (
    <section id="casos" className="sc border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Onde a energia trabalha"
            title={
              <>
                Do galpão ao painel:{" "}
                <span className="text-gradient-energy">
                  números reais do setor.
                </span>
              </>
            }
            description="Cenários reais de uso de energia, acompanhados de referências públicas da EPE. São exemplos de mercado, não resultados de clientes da WattIQ."
          />
        </Reveal>

        <Reveal delay={120}>
          <div
            className="sc-wrap mt-14"
            role="region"
            aria-roledescription="carrossel"
            aria-label="Cenários reais de consumo de energia"
            tabIndex={0}
            onKeyDown={onKey}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              ref={stageRef}
              className="sc-stage"
              data-run={running}
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                startX.current = e.clientX;
                moved.current = false;
              }}
              onPointerMove={(e) => {
                if (startX.current == null) return;
                if (Math.abs(e.clientX - startX.current) > 6)
                  moved.current = true;
              }}
              onPointerUp={(e) => {
                if (startX.current == null) return;
                const dx = e.clientX - startX.current;
                startX.current = null;
                if (dx < -48) next();
                else if (dx > 48) back();
                else if (!moved.current) setZoomed(true);
              }}
              onPointerLeave={() => {
                startX.current = null;
              }}
            >
              {prev >= 0 && prev !== active && (
                <div
                  key={`out-${prev}-${active}`}
                  className="sc-layer sc-out"
                  style={{ ["--dir" as string]: dir }}
                  aria-hidden
                >
                  {img(prev)}
                </div>
              )}

              <div
                key={`in-${active}`}
                className={`sc-layer ${prev >= 0 ? "sc-in" : ""}`}
                style={{ ["--dir" as string]: dir }}
              >
                {img(active, "sc-kenburns")}
              </div>

              <div className="sc-shade" aria-hidden />

              <div className="sc-top" aria-hidden>
                <div
                  key={`bar-${active}`}
                  className="sc-progress"
                  style={{ animationDuration: `${DURATION}ms` }}
                  onAnimationEnd={next}
                />
              </div>

              <button
                type="button"
                className="sc-btn sc-zoom"
                aria-label="Ampliar imagem"
                onClick={() => setZoomed(true)}
              >
                ⤢
              </button>

              <div className="sc-caption" key={`cap-${active}`}>
                <div className="sc-copy">
                  <p className="sc-area sc-fade" style={{ animationDelay: "200ms" }}>
                    <i /> {s.area}
                  </p>
                  <h3 className="sc-title">
                    <span className="sc-rise">{s.title}</span>
                  </h3>
                  <p className="sc-text sc-fade" style={{ animationDelay: "480ms" }}>
                    {s.text}
                  </p>
                </div>

                <div className="sc-stat sc-fade" style={{ animationDelay: "380ms" }}>
                  <p className="sc-stat-value">{s.stat.value}</p>
                  <p className="sc-stat-label">{s.stat.label}</p>
                  <p className="sc-stat-source">{s.stat.source}</p>
                </div>
              </div>
            </div>

            <div className="sc-ctl">
              <p className="sc-count" aria-live="polite">
                <b>{String(active + 1).padStart(2, "0")}</b> /{" "}
                {String(total).padStart(2, "0")}
              </p>

              <div
                ref={thumbsRef}
                className="sc-thumbs"
                role="tablist"
                aria-label="Escolher cenário"
              >
                {slides.map((sl, i) => (
                  <button
                    key={sl.id}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={sl.title}
                    className={i === active ? "on" : ""}
                    onClick={() => go(i)}
                  >
                    {!broken[sl.id] && (
                      <img
                        src={photo(sl.id, 320, 200, 55)}
                        alt=""
                        loading="lazy"
                        draggable={false}
                      />
                    )}
                    <i />
                  </button>
                ))}
              </div>

              <div className="sc-arrows">
                <button
                  type="button"
                  className="sc-btn"
                  aria-label="Cenário anterior"
                  onClick={back}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="sc-btn sc-pri"
                  aria-label="Próximo cenário"
                  onClick={next}
                >
                  →
                </button>
              </div>
            </div>

            <p className="sc-note">
              Fotos: Unsplash. Dados: EPE (referências públicas). Os valores
              acima não representam clientes nem resultados da WattIQ.
            </p>
          </div>
        </Reveal>
      </div>

      <dialog
        ref={dialogRef}
        className="sc-dialog"
        aria-label={s.title}
        onClose={() => setZoomed(false)}
        onKeyDown={onKey}
      >
        <div className="sc-dialog-in">
          <div className="sc-dialog-top">
            <span>
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")} · {s.area}
            </span>
            <button
              type="button"
              className="sc-btn"
              aria-label="Fechar imagem ampliada"
              onClick={() => setZoomed(false)}
            >
              ✕
            </button>
          </div>
          <div className="sc-dialog-img">
            {zoomed && !broken[s.id] && (
              <img src={photo(s.id)} alt={s.title} draggable={false} />
            )}
          </div>
          <div className="sc-dialog-bot">
            <p>{s.title}</p>
            <div className="sc-arrows">
              <button type="button" className="sc-btn" aria-label="Anterior" onClick={back}>
                ←
              </button>
              <button type="button" className="sc-btn" aria-label="Próximo" onClick={next}>
                →
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
