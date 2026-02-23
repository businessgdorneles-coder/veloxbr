import { ShieldCheck, Truck, CreditCard, Award, Clock, MessageCircle } from "lucide-react";

const trustItems = [
  { icon: ShieldCheck, title: "Compra Segura", color: "text-primary" },
  { icon: Truck, title: "Frete Grátis", color: "text-success" },
  { icon: CreditCard, title: "PIX 5% OFF", color: "text-warning" },
  { icon: MessageCircle, title: "Suporte Real", color: "text-primary" },
  { icon: Award, title: "Garantia", color: "text-success" },
  { icon: Clock, title: "Entrega Rápida", color: "text-warning" },
];

const TrustBar = () => {
  return (
    <section className="py-4 bg-hero-dark border-y border-white/10">
      <div className="container">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide justify-center">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-1.5 shrink-0">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-white/70 text-xs font-semibold whitespace-nowrap">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
