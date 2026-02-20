import { Car, Sparkles, Shield, TrendingUp } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

const emotions = [
  {
    icon: TrendingUp,
    title: "Valorize seu carro",
    desc: "Um interior conservado vale mais na revenda. Cada real investido hoje retorna na hora de vender.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Sparkles,
    title: "Sensação de carro novo",
    desc: "Instale uma vez e sinta a diferença imediatamente. Interior sempre limpo, sem odores.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Proteção real",
    desc: "Café, barro, chuva — nada chega ao assoalho original do seu veículo.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Car,
    title: "Para qualquer veículo",
    desc: "Fabricamos para carros e caminhões de qualquer marca, modelo e ano.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const EmotionalSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <span className="inline-block bg-warning/10 text-warning text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Mais do que um tapete
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            O cuidado que seu carro{" "}
            <span className="text-gradient-blue">merece</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Não é sobre o tapete. É sobre o prazer de entrar num carro com interior impecável, todo dia.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image collage */}
          <div className="grid grid-cols-2 gap-3 relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/5] shadow-card border border-border/50">
              <img src={gallery1} alt="Interior do carro com tapete premium" className="w-full h-full object-cover" loading="lazy" decoding="async" width={280} height={350} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl overflow-hidden aspect-square shadow-card border border-border/50">
                <img src={gallery2} alt="Tapete bandeja 3D instalado" className="w-full h-full object-cover" loading="lazy" decoding="async" width={280} height={280} />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square shadow-card border border-border/50">
                <img src={gallery3} alt="Detalhe do encaixe perfeito" className="w-full h-full object-cover" loading="lazy" decoding="async" width={280} height={280} />
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-blue text-center">
              <p className="text-2xl font-display font-bold">5.000+</p>
              <p className="text-xs font-medium opacity-80">clientes felizes</p>
            </div>
          </div>

          {/* Emotion cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {emotions.map((e) => (
              <div key={e.title} className="bg-card border border-border/50 rounded-2xl p-5 shadow-card hover-lift">
                <div className={`w-11 h-11 rounded-xl ${e.bg} flex items-center justify-center mb-3`}>
                  <e.icon className={`w-5 h-5 ${e.color}`} />
                </div>
                <h4 className="font-display font-bold text-sm mb-2">{e.title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmotionalSection;
