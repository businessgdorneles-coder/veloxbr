import { Menu, Search } from "lucide-react";
import logoVelox from "@/assets/logo-velox.webp";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
      <div className="container flex items-center justify-between py-3">
        <button aria-label="Menu" className="text-white">
          <Menu className="w-6 h-6" />
        </button>
        <a href="/">
          <img src={logoVelox} alt="Velox" className="h-8 sm:h-10 object-contain" />
        </a>
        <button aria-label="Buscar" className="text-white">
          <Search className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
