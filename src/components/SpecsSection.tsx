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
    <section className="py-16 md:py-24 bg-section-alt">
      <div className="container max-w-4xl">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-3">
          Materiais premium em cada detalhe
        </h2>
        <p className="text-muted-foreground text-center mb-10 text-sm md:text-base">
          Polipropileno premium + TPE moldado em 3D, base antiderrapante e alta resistência à água e desgaste.
        </p>

        <div className="max-w-2xl mx-auto mb-10 rounded-xl overflow-hidden shadow-md">
          <img
            src="https://oficialcarpetcar.com/img/material.gif"
            alt="Material premium do tapete veicular"
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        <div className="bg-card rounded-xl border border-border/50 p-6 md:p-8">
          <h3 className="font-display font-bold text-lg mb-4">Especificações</h3>
          <ul className="space-y-3">
            {specs.map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-xs text-primary font-bold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            <span className="font-semibold text-primary">Importante:</span>{" "}
            Nossos tapetes são sob medida. Para comprar o kit correto, selecione <strong>Marca</strong>, <strong>Modelo</strong> e <strong>Ano</strong> do seu carro.
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecsSection;
