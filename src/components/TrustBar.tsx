import { ShieldCheck, Truck, MessageCircle, CreditCard, Award, Clock } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Compra 100% Segura",
    desc: "Site protegido com SSL e criptografia",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Truck,
    title: "Frete Grátis",
    desc: "Entrega pelos Correios com rastreio",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: CreditCard,
    title: "PIX com 5% OFF",
    desc: "Pagamento à vista com desconto",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: MessageCircle,
    title: "Suporte Humanizado",
    desc: "Atendimento real, sem robôs",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Award,
    title: "Garantia de Qualidade",
    desc: "Garantia contra defeitos de fábrica",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Clock,
    title: "Produção Rápida",
    desc: "Fabricado em até 5 dias úteis",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const TrustBar = () => {
  return (
    <section className="py-10 bg-section-alt border-y border-border">
      <div className="container">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
          Por que mais de 5.000 clientes confiam na CarpetCar
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustItems.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover-lift shadow-card">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="text-xs font-bold leading-tight">{item.title}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
