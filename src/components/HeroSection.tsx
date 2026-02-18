import heroImage from "@/assets/hero-original.png";

const HeroSection = () => {
  return (
    <section className="bg-hero-dark py-12 md:py-20">
      <div className="container text-center">
        <p className="text-hero-foreground/70 text-sm md:text-base font-medium tracking-wide uppercase mb-2">
          Seu carro com interior de luxo
        </p>
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-hero-foreground mb-2">
          Tapete <span className="text-gradient-blue">sob medida</span>
        </h1>
        <p className="text-hero-foreground/60 text-sm md:text-lg max-w-xl mx-auto mb-8">
          Cobertura total, acabamento premium e encaixe perfeito no seu veículo.
        </p>
        <div className="max-w-3xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-blue">
          <img
            src={heroImage}
            alt="Tapete automotivo premium aplicado no carro"
            className="w-full h-auto object-cover"
            loading="eager"
          />
        </div>
        <a
          href="#produto"
          className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-lg text-base md:text-lg shadow-blue hover:brightness-110 transition-all"
        >
          ESCOLHER MODELO
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
