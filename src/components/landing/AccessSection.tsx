import { Link } from "@tanstack/react-router";
import { Reveal, SectionHeading } from "./primitives";

const steps = [
  {
    step: "01",
    title: "Configure as chaves no Render",
    body: "No painel do Render: Service → Environment → Add Environment Variable. Entram GEMINI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e AUTH_REDIRECT_URL. Nenhuma chave fica no front-end.",
  },
  {
    step: "02",
    title: "Reinicie o serviço",
    body: "O Render aplica as variáveis no próximo restart/deploy. Enquanto isso não acontece, o login e a camada de interpretação ficam intencionalmente inativos.",
  },
  {
    step: "03",
    title: "Faça login em /auth",
    body: "O acesso acontece em um único lugar: a página /auth. Google ou e-mail e senha. De lá você entra direto no painel da sua empresa.",
  },
];

export function AccessSection() {
  return (
    <section id="acesso" className="relative overflow-hidden border-b border-border py-24">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Acesso"
            title={
              <>
                Onde fica o login <span className="text-gradient-energy">depois do Render</span>
              </>
            }
            description="Uma dúvida comum: a chave da API vai no Render, o login vai na plataforma. São passos diferentes, nesta ordem."
          />
        </Reveal>

        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.step} delay={i * 110}>
              <div className="lift h-full rounded-xl border border-border bg-card p-7 hover:border-primary/50 hover:lift-hover">
                <span className="font-mono text-xs tracking-widest text-primary">{s.step}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={140}>
          <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-xl border border-border bg-card/60 p-7 sm:flex-row">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Já configurou as variáveis? O ponto de entrada é sempre o mesmo endereço:{" "}
              <code className="text-primary">/auth</code>.
            </p>
            <Link
              to="/auth"
              className="lift shrink-0 rounded-md bg-gradient-energy animate-gradient px-6 py-3 text-sm font-semibold text-primary-foreground hover:lift-hover"
            >
              Ir para a tela de login
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
