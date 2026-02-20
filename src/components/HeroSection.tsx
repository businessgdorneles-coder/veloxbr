import { ShieldCheck, Zap, Star, Lock } from "lucide-react";
import heroImage from "@/assets/hero-original.png";
import prod1 from "@/assets/prod1.webp";

const HeroSection = () => {
  return (
    <section className="bg-hero-dark overflow-hidden">
      {/* Top urgency bar */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center">
        <p className="text-xs text-primary font-semibold tracking-wide">
          🔥 OFERTA LIMITADA — Frete grátis para todo o Brasil • Produção sob medida em até 5 dias
        </p>
      </div>

      <div className="container py-8 md:py-20">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Left: Copy — always first on mobile */}
          <div className="text-center lg:text-left order-1">
            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                ))}
              </div>
              <span className="text-white/80 text-xs font-medium">+5.000 clientes satisfeitos</span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-3">
              Seu carro merece um{" "}
              <span className="text-gradient-blue">interior</span>{" "}
              à altura.
            </h1>

            <p className="text-white/60 text-sm md:text-lg max-w-lg mx-auto lg:mx-0 mb-5 leading-relaxed">
              Tapetes 3D sob medida com encaixe perfeito, acabamento premium e proteção total.
            </p>

            {/* CTA Block */}
            <div className="mb-5">
              <a
                href="#produto"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl text-base shadow-blue-lg animate-pulse-glow hover:brightness-110 transition-all w-full sm:w-auto"
              >
                <Zap className="w-4 h-4" />
                QUERO MEU TAPETE AGORA
              </a>
            </div>

            {/* Trust micro-badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {[
                { icon: Lock, label: "Pagamento Seguro" },
                { icon: ShieldCheck, label: "Garantia Inclusa" },
                { icon: ShieldCheck, label: "PIX com 5% OFF" },
              ].map((item) => (
                <div key={item.label} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <item.icon className="w-3 h-3 text-primary" />
                  <span className="text-white/70 text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image — second on mobile */}
          <div className="order-2 relative">
            <div className="relative max-w-sm mx-auto lg:max-w-none">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl scale-90 translate-y-4" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-blue-lg">
                <img
                  src={heroImage}
                  alt="Tapete automotivo 3D premium instalado no carro"
                  className="w-full h-auto object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={640}
                  height={420}
                />
                {/* Overlay badge */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                  <p className="text-white text-xs font-semibold">Encaixe sob medida</p>
                  <p className="text-primary text-[10px]">Fabricado para o seu veículo</p>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -top-3 -right-3 bg-success text-white rounded-xl px-3 py-2 shadow-lg text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide">Mais Vendido</p>
                <p className="text-xs font-bold">Kit Completo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
