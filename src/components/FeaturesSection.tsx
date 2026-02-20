import { ShieldCheck, Droplets, Wrench, Zap, Car, SprayCan } from "lucide-react";
import prod1 from "@/assets/prod1.webp";
import prod4 from "@/assets/prod4.png";

const features = [
  { icon: Wrench, title: "Instalação sem ferramentas", desc: "Colocou, encaixou — 2 minutos e está pronto." },
  { icon: Droplets, title: "Impermeável total", desc: "Líquidos, lama e sujeira não chegam no tapete original." },
  { icon: ShieldCheck, title: "Base antiderrapante", desc: "Fixado com trava original do carro. Sem riscos." },
  { icon: SprayCan, title: "Limpeza instantânea", desc: "Pano úmido ou água — limpo em menos de 1 minuto." },
  { icon: Car, title: "Valoriza o veículo", desc: "Interior sempre novo. Aumenta o valor de revenda." },
  { icon: Zap, title: "7mm de espessura", desc: "Material robusto, resistente e com vida útil longa." },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-dark-section">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Diferenciais técnicos
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            Tecnologia que você{" "}
            <span className="text-gradient-blue">sente na hora</span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Cada detalhe foi pensado para oferecer a melhor experiência dentro do seu carro.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Image side */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/15 rounded-3xl blur-3xl" />
            <div className="relative grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square">
                <img src={prod1} alt="Tapete bandeja 3D" className="w-full h-full object-cover" loading="lazy" decoding="async" width={280} height={280} />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square mt-6">
                <img src={prod4} alt="Detalhe do material premium" className="w-full h-full object-cover" loading="lazy" decoding="async" width={280} height={280} />
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-display font-bold text-sm text-white mb-1">{f.title}</h4>
                <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
