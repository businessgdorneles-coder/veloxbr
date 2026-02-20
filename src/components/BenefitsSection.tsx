import { useState, useEffect, useRef } from "react";
import { proxyUrl } from "@/lib/mediaProxy";
import { Check, X } from "lucide-react";

const benefits = [
  {
    gif: proxyUrl("https://oficialcarpetcar.com/img/gifcobertuura.gif"),
    title: "Cobertura total do assoalho",
    description: "Sem áreas expostas. Do motorista ao banco traseiro, cobertura completa.",
    number: "01",
  },
  {
    gif: proxyUrl("https://oficialcarpetcar.com/img/encaixe%20soobmedida%20gif.gif"),
    title: "Encaixe perfeito sob medida",
    description: "Modelado para o seu veículo. Não escorrega, não atrapalha pedais.",
    number: "02",
  },
  {
    gif: proxyUrl("https://oficialcarpetcar.com/img/giflimpeza.gif"),
    title: "Limpeza em segundos",
    description: "Pano úmido ou água. Resistente a líquidos, lama e sujeira pesada.",
    number: "03",
  },
];

const comparisons = [
  { feature: "Encaixe personalizado", common: false, our: true },
  { feature: "Impermeável", common: false, our: true },
  { feature: "Base antiderrapante", common: false, our: true },
  { feature: "Cobertura total do assoalho", common: false, our: true },
  { feature: "Fácil de remover e lavar", common: false, our: true },
  { feature: "Durabilidade premium (7mm)", common: false, our: true },
];

const EagerGif = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="w-full h-full object-cover" loading="eager" decoding="async" fetchPriority="high" width={400} height={400} />
);

const LazyGif = ({ src, alt }: { src: string; alt: string }) => {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setLoaded(true); observer.disconnect(); } }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <img ref={ref} src={loaded ? src : undefined} alt={alt} className="w-full h-full object-cover" loading="lazy" decoding="async" width={400} height={400} />;
};

const BenefitsSection = () => {
  return (
    <>
      {/* Benefits */}
      <section id="beneficios" className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              Por que o tapete bandeja 3D?
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              3 motivos que fazem{" "}
              <span className="text-gradient-blue">toda a diferença</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Não é só tapete. É proteção, encaixe e praticidade em um único produto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <div key={b.title} className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover-lift shadow-card">
                <div className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-display">
                  {b.number}
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {i === 0 ? <EagerGif src={b.gif} alt={b.title} /> : <LazyGif src={b.gif} alt={b.title} />}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold mb-1.5">{b.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-section-alt">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              Comparativo
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              Tapete comum <span className="text-muted-foreground font-normal">vs</span>{" "}
              <span className="text-gradient-blue">Bandeja 3D</span>
            </h2>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card">
            <div className="grid grid-cols-3 bg-muted/60 border-b border-border/50">
              <div className="p-4 text-sm font-bold text-center text-muted-foreground">Recurso</div>
              <div className="p-4 text-sm font-bold text-center text-muted-foreground border-l border-border/50">Tapete comum</div>
              <div className="p-4 text-sm font-bold text-center text-primary border-l border-border/50">Bandeja 3D</div>
            </div>
            {comparisons.map((c, i) => (
              <div key={c.feature} className={`grid grid-cols-3 items-center ${i < comparisons.length - 1 ? "border-b border-border/50" : ""}`}>
                <div className="p-4 text-sm font-medium">{c.feature}</div>
                <div className="p-4 flex justify-center border-l border-border/50">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-destructive" />
                  </div>
                </div>
                <div className="p-4 flex justify-center border-l border-border/50">
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-success" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BenefitsSection;
