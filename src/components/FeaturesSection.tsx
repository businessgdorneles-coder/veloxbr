import { Check, Wrench, Droplets, ShieldCheck, SprayCan } from "lucide-react";

const features = [
  { icon: Wrench, title: "Fácil de instalar", desc: "Colocou, encaixou, pronto — sem ferramentas." },
  { icon: Droplets, title: "Fácil de limpar", desc: "Pano úmido ou água. Sem dor de cabeça." },
  { icon: ShieldCheck, title: "Não escorrega", desc: "Base antiderrapante para mais segurança." },
  { icon: SprayCan, title: "Protege contra sujeira e líquidos", desc: "Mantém o interior sempre com cara de novo." },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-3">
          Simples no dia a dia
        </h2>
        <p className="text-muted-foreground text-center mb-12 text-sm md:text-base">
          Benefícios práticos que você sente na hora.
        </p>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 items-start p-5 rounded-xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{f.title}</h4>
                <p className="text-muted-foreground text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
