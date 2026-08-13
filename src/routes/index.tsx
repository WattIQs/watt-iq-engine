import { createFileRoute } from "@tanstack/react-router";

import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <ProblemSection />
        <ContextSection />
        <SolutionSection />
        <HowSection />
        <IndicatorsSection />
        <IntelligenceSection />
        <DashboardSection />
        <CtaSection />
      </main>
    </div>
  );
}
