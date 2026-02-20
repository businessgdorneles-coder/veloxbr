const specs = [
  "Polipropileno premium + TPE moldado em 3D + base antiderrapante",
  "Kit completo: tapete do motorista, passageiro e traseiros",
  "Fixado com trava original (ilhós padrão de fábrica)",
  "7mm de espessura",
  "Encaixe perfeito (100% sob medida)",
  "Base emborrachada e pinada",
];

const SpecsSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Material & Especificações
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Premium em cada <span className="text-gradient-blue">detalhe</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Polipropileno premium + TPE moldado em 3D, base antiderrapante e alta resistência à água.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden shadow-blue-lg border border-border/50">
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/media-proxy?url=${encodeURIComponent("https://oficialcarpetcar.com/img/material.gif")}`}
              alt="Material premium do tapete veicular"
              className="w-full h-auto object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={540}
              height={304}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-card">
              <h3 className="font-display font-bold text-lg mb-4">Especificações técnicas</h3>
              <ul className="space-y-3">
                {specs.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-white font-bold">✓</span>
                    </span>
                    <span className="text-foreground/80">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-sm">
              <p className="font-bold text-primary mb-1">⚠️ Importante sobre o pedido</p>
              <p className="text-muted-foreground">
                Nossos tapetes são 100% sob medida. Selecione <strong>Marca</strong>, <strong>Modelo</strong> e <strong>Ano</strong> do seu veículo para garantir o encaixe perfeito.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecsSection;
