import { useState } from "react";
import { Menu, X, Search, Phone, ShoppingBag, HelpCircle } from "lucide-react";
import logoVelox from "@/assets/logo-velox.png";

const menuItems = [
  { label: "Produtos", href: "/" },
  { label: "Como Funciona", href: "/#descricao" },
  { label: "Avaliações", href: "/#avaliacoes" },
  { label: "Fale Conosco", href: "https://wa.me/5511974004406", external: true },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
        <div className="container flex items-center justify-between py-3">
          <button
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="text-white"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <a href="/">
            <img src={logoVelox} alt="Velox" className="h-8 sm:h-10 object-contain" />
          </a>

          <a
            href="https://wa.me/5511974004406"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fale conosco"
            className="text-white"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-primary shadow-2xl transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary-foreground/10">
          <img src={logoVelox} alt="Velox" className="h-8 object-contain" />
          <button onClick={() => setMenuOpen(false)} className="text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col py-4">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-4 text-white hover:bg-primary-foreground/10 transition-colors text-sm font-medium"
            >
              {item.label === "Fale Conosco" && <Phone className="w-4 h-4 text-green-400" />}
              {item.label === "Produtos" && <ShoppingBag className="w-4 h-4 text-primary-foreground/60" />}
              {item.label === "Como Funciona" && <HelpCircle className="w-4 h-4 text-primary-foreground/60" />}
              {item.label === "Avaliações" && <Search className="w-4 h-4 text-primary-foreground/60" />}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-8 left-5 right-5">
          <p className="text-primary-foreground/30 text-xs text-center">
            Velox Centro Automotivo LTDA
          </p>
        </div>
      </div>
    </>
  );
};

export default Header;
