import {
  createFileRoute,
} from "@tanstack/react-router";

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
  AccessSection,
  CtaSection,
} from "@/components/landing/Sections";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useSmoothScroll();

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
