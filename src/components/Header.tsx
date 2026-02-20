import { ShieldCheck, Phone } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-hero-dark/95 backdrop-blur-md">
      <div className="container flex items-center justify-between py-3.5">
        <span className="font-display text-xl font-bold tracking-tight text-white">
          <span className="text-gradient-blue">CARPET</span>CAR
        </span>

        <div className="flex items-center gap-4">
          <a
            href="tel:+5511974004406"
            className="hidden sm:flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            (11) 97400-4406
          </a>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="hidden sm:inline">COMPRA 100% SEGURA</span>
          </div>
          <a
            href="#produto"
            className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-lg shadow-blue hover:brightness-110 transition-all"
          >
            COMPRAR AGORA
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
