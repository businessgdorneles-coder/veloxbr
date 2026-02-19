import iconEnvio from "@/assets/icon-envio.png";
import iconAtendimento from "@/assets/icon-atendimento.png";
import iconPix from "@/assets/icon-pix.png";
import iconSsl from "@/assets/icon-ssl.png";

const items = [
  { icon: iconEnvio, title: "Envio rápido", desc: "Código de rastreio enviado" },
  { icon: iconAtendimento, title: "Suporte ao cliente", desc: "Atendimento humanizado" },
  { icon: iconPix, title: "Pagamento à vista", desc: "5% de desconto no Pix" },
  { icon: iconSsl, title: "Compra 100% segura", desc: "Site protegido com SSL" },
];

const TrustBar = () => {
  return (
    <section className="py-8 border-y border-border bg-trust">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <img src={item.icon} alt={item.title} className="w-10 h-10 object-contain shrink-0" style={{ filter: "invert(30%) sepia(100%) saturate(500%) hue-rotate(190deg) brightness(1.1)" }} />
              <div>
                <p className="text-xs md:text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
