import { ShieldCheck } from "lucide-react";

const Logo = () => (
  <a href="/" className="flex items-center gap-2 shrink-0">
    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-blue shrink-0">
      <span className="font-display text-primary-foreground font-bold text-sm leading-none">CC</span>
    </div>
    <span className="font-display font-bold tracking-tight leading-none">
      <span
        className="text-xl"
        style={{
          background: "linear-gradient(135deg, hsl(217,91%,55%), hsl(200,90%,60%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        CARPET
      </span>
      <span className="text-xl text-white">CAR</span>
    </span>
  </a>
);

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[hsl(220,40%,8%)] border-b border-white/10">
      <div className="container flex items-center justify-between py-3">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white/60">
            <ShieldCheck className="w-4 h-4 text-success" />
            COMPRA 100% SEGURA
          </div>
          <a
            href="#produto"
            className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-lg shadow-blue hover:brightness-110 transition-all whitespace-nowrap"
          >
            COMPRAR AGORA
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
