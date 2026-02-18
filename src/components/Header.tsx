import { Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="text-gradient-blue">CARPET</span>CAR
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-success" />
          COMPRA 100% SEGURA
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-border bg-card p-4 space-y-3">
          <a href="#beneficios" className="block text-sm font-medium" onClick={() => setOpen(false)}>Benefícios</a>
          <a href="#produto" className="block text-sm font-medium" onClick={() => setOpen(false)}>Produto</a>
          <a href="#avaliacoes" className="block text-sm font-medium" onClick={() => setOpen(false)}>Avaliações</a>
          <a href="#faq" className="block text-sm font-medium" onClick={() => setOpen(false)}>FAQ</a>
        </nav>
      )}
    </header>
  );
};

export default Header;
