import { Mail, Phone, MapPin, Clock, Shield, BadgeCheck } from "lucide-react";
import logoVelox from "@/assets/logo-velox.png";

const Footer = () => {
  return (
    <footer className="bg-dark-section border-t border-white/10">
      {/* Final CTA strip */}
      <div className="bg-primary/10 border-b border-primary/20 py-6">
        <div className="container text-center">
          <p className="font-display text-lg font-bold text-white mb-2">
            Pronto para transformar o interior do seu carro?
          </p>
          <a
            href="#produto"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl text-sm shadow-blue hover:brightness-110 transition-all"
          >
            ESCOLHER MEU KIT AGORA
          </a>
        </div>
      </div>

      <div className="container max-w-4xl py-10">
        <div className="grid sm:grid-cols-3 gap-8 mb-8 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2 mb-3">
              <img src={logoVelox} alt="Velox" className="h-8 object-contain" />
              <BadgeCheck className="w-4 h-4 text-success" />
              <span className="text-success text-xs font-bold">Loja Verificada</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Tapetes automotivos 3D premium, produzidos sob medida para o seu veículo.
            </p>
          </div>

          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Atendimento</p>
            <div className="space-y-2">
              <a href="tel:+5511974004406" className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors justify-center sm:justify-start">
                <Phone className="w-3.5 h-3.5 text-primary" /> (11) 97400-4406
              </a>
              <a href="mailto:suporte@carpetcar.com" className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors justify-center sm:justify-start">
                <Mail className="w-3.5 h-3.5 text-primary" /> suporte@carpetcar.com
              </a>
              <p className="flex items-center gap-2 text-white/50 text-xs justify-center sm:justify-start">
                <Clock className="w-3.5 h-3.5 text-primary" /> Seg–Sex, 08h às 18h
              </p>
            </div>
          </div>

          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Empresa</p>
            <div className="space-y-2">
              <p className="text-white/50 text-xs">Velox Centro Automotivo LTDA</p>
              <p className="text-white/50 text-xs">CNPJ: 64.809.798/0001-08</p>
              <p className="flex items-start gap-2 text-white/50 text-xs justify-center sm:justify-start">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                Av. Jorge João Saad, SN Vl. Progredior – CEP: 05618-000 – São Paulo/SP
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Pagamento seguro • Ambiente protegido com SSL</span>
          </div>
          <p className="text-white/20 text-[10px]">
            &copy; {new Date().getFullYear()} Velox LTDA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
