import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/landing/SiteChrome";
import { Hero } from "@/components/landing/Hero";
import {
  ProblemSection,
  ContextSection,
  SolutionSection,
  HowSection,
  IndicatorsSection,
  IntelligenceSection,
  DashboardSection,
  CtaSection,
} from "@/components/landing/Sections";
import { AccessSection } from "@/components/landing/AccessSection";

const title = "WattIQ — Energia medida. Inteligência aplicada.";
const description =
  "Plataforma de monitoramento e inteligência energética para empresas: transforme consumo em indicadores contextualizados e insights acionáveis.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <ProblemSection />
        <ContextSection />
        <SolutionSection />
        <HowSection />
        <IndicatorsSection />
        <IntelligenceSection />
        <DashboardSection />
        <AccessSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
