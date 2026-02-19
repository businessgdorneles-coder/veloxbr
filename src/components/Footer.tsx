import { Mail, Phone, MapPin, Clock, Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-hero-dark py-8 text-hero-foreground/60">
      <div className="container max-w-4xl text-center space-y-4">
        <p className="font-display text-lg font-bold text-hero-foreground">
          <span className="text-gradient-blue">CARPET</span>CAR LTDA
        </p>
        <p className="text-xs">CNPJ: 07.418.219/0001-54</p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" /> Seg–Sex, 08h às 18h
          </span>
          <a href="mailto:suporte@carpetcar.com" className="inline-flex items-center gap-1.5 hover:text-hero-foreground transition-colors">
            <Mail className="w-3.5 h-3.5 text-primary" /> suporte@carpetcar.com
          </a>
          <a href="tel:+5511974004406" className="inline-flex items-center gap-1.5 hover:text-hero-foreground transition-colors">
            <Phone className="w-3.5 h-3.5 text-primary" /> (11) 97400-4406
          </a>
        </div>

        <p className="inline-flex items-center justify-center gap-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Rua Benedito Carvalho, SN, Jardim Bom Jesus — Tremembé-SP, CEP 12125-118
        </p>

        <div className="flex items-center justify-center gap-1.5 text-xs text-hero-foreground/40 pt-2 border-t border-hero-foreground/10">
          <Shield className="w-3.5 h-3.5" />
          <span>Pagamento seguro • Ambiente protegido</span>
        </div>

        <p className="text-[10px] text-hero-foreground/30">
          &copy; {new Date().getFullYear()} CarpetCar LTDA. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
