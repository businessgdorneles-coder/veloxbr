const stats = [
  { value: "100%", label: "QUALIDADE" },
  { value: "100%", label: "PERSONALIZADO" },
  { value: "1.638+", label: "CLIENTES" },
];

const features = [
  "✓ Borracha antiderrapante",
  "✓ 100% impermeável",
  "✓ Bordas de proteção elevadas",
  "✓ Encaixe perfeito no veículo",
  "✓ Limpeza em segundos",
  "✓ 7mm de espessura premium",
];

const StatsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-hero-dark">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Proteção Total
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
            Tapetes sob medida{" "}
            <span className="text-gradient-blue">para cada modelo e ano</span>
          </h2>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mb-12">
          {features.map((f) => (
            <div key={f} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 font-medium">
              {f}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="font-display font-black text-3xl md:text-4xl text-primary mb-1">{s.value}</p>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
