import { Link } from "@tanstack/react-router";
import mark from "@/assets/wattiq-mark.png.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5" aria-label="WattIQ — início">
          <img src={mark.url} alt="" aria-hidden className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold tracking-tight">
            Watt<span className="text-primary">IQ</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#problema" className="transition-colors hover:text-foreground">O problema</a>
          <a href="#solucao" className="transition-colors hover:text-foreground">A solução</a>
          <a href="#indicadores" className="transition-colors hover:text-foreground">Indicadores</a>
          <a href="#intelligence" className="transition-colors hover:text-foreground">Intelligence</a>
        </nav>
        <a
          href="#cta"
          className="rounded-md bg-gradient-energy px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Acessar plataforma
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-6xl px-5 text-center text-sm text-muted-foreground">
        © 2026 WattIQ. Todos os direitos reservados.
      </div>
    </footer>
  );
}
