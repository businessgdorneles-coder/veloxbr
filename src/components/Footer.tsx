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
              <a href="https://wa.me/5511974004406" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors justify-center sm:justify-start">
                <Phone className="w-3.5 h-3.5 text-primary" /> (11) 97400-4406
              </a>
              <a
                href="https://wa.me/5511974004406"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:brightness-110 transition-all mt-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Falar pelo WhatsApp
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
              <p className="text-white/50 text-xs">CNPJ: 13.310.559/0001-60</p>
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
