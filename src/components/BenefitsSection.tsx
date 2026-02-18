import { Shield, Ruler, Droplets } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Cobertura total",
    description: "Protege o assoalho inteiro, sem áreas expostas.",
  },
  {
    icon: Ruler,
    title: "Encaixe sob medida",
    description: "Ajuste perfeito para não escorregar e não atrapalhar pedais.",
  },
  {
    icon: Droplets,
    title: "Fácil de limpar",
    description: "Resistente a água e sujeira. Limpeza rápida no dia a dia.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-section-alt">
      <div className="container">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-3">
          Por que escolher os tapetes <span className="text-gradient-blue">BANDEJA</span>?
        </h2>
        <p className="text-muted-foreground text-center mb-12 text-sm md:text-base">
          3 benefícios rápidos que fazem a diferença.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-card rounded-xl p-8 text-center shadow-sm border border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <b.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
