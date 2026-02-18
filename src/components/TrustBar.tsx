import { Truck, Headphones, CreditCard, ShieldCheck } from "lucide-react";

const items = [
  { icon: Truck, title: "Envio rápido", desc: "Código de rastreio enviado" },
  { icon: Headphones, title: "Suporte ao cliente", desc: "Atendimento humanizado" },
  { icon: CreditCard, title: "Pagamento à vista", desc: "5% de desconto no Pix" },
  { icon: ShieldCheck, title: "Compra 100% segura", desc: "Site protegido com SSL" },
];

const TrustBar = () => {
  return (
    <section className="py-8 border-y border-border bg-trust">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
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
