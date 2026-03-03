import descricaoBanner from "@/assets/descricao-banner-new.webp";
import antes1 from "@/assets/antes1.webp";
import depois1 from "@/assets/depois1.webp";
import antes2 from "@/assets/antes2.webp";
import depois2 from "@/assets/depois2.webp";
import detalhe1 from "@/assets/detalhe1.webp";
import detalhe2 from "@/assets/detalhe2.webp";
import detalhe3 from "@/assets/detalhe3.webp";
import tapeteInstalado from "@/assets/tapete-instalado.webp";
import satisfacao1 from "@/assets/satisfacao1.webp";
import satisfacao2 from "@/assets/satisfacao2.webp";
import satisfacao3 from "@/assets/satisfacao3.webp";
import satisfacao4 from "@/assets/satisfacao4.webp";
import satisfacao5 from "@/assets/satisfacao5.webp";

const features = [
  "✓ Borracha antiderrapante",
  "✓ 100% impermeável",
  "✓ Bordas de proteção elevadas",
  "✓ Encaixe perfeito no veículo",
];

const stats = [
  { value: "100%", label: "QUALIDADE" },
  { value: "100%", label: "PERSONALIZADO" },
  { value: "1000+", label: "CLIENTES" },
];

const satisfacaoImages = [satisfacao1, satisfacao2, satisfacao3, satisfacao4, satisfacao5];

const DescriptionSection = () => {
  return (
    <div className="bg-background">
      {/* Divider */}
      <div className="container max-w-5xl">
        <hr className="border-border" />
      </div>

      {/* Descrição heading + banner */}
      <section className="py-10">
        <div className="container max-w-5xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">Descrição</h2>
          <div className="rounded-2xl overflow-hidden border border-border">
            <img src={descricaoBanner} alt="Descrição do Tapete Bandeja 3D Premium" className="w-full h-auto" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* Clientes Recebendo - Antes/Depois */}
      <section className="py-10 bg-section-alt">
        <div className="container max-w-5xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">CLIENTES RECEBENDO</h2>
          <h3 className="text-lg font-display font-bold text-center mb-1">Antes / Depois</h3>
          <p className="text-muted-foreground text-sm text-center mb-8">Mantendo o veículo limpo e protegido</p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Pair 1 */}
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={antes1} alt="Antes - veículo sujo" className="w-full h-auto" loading="lazy" decoding="async" />
              </div>
              <p className="text-center text-sm font-bold text-muted-foreground">Antes</p>
            </div>
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={depois1} alt="Depois - veículo protegido" className="w-full h-auto" loading="lazy" decoding="async" />
              </div>
              <p className="text-center text-sm font-bold text-success">Depois</p>
            </div>
            {/* Pair 2 */}
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={antes2} alt="Antes - sem tapete" className="w-full h-auto" loading="lazy" decoding="async" />
              </div>
              <p className="text-center text-sm font-bold text-muted-foreground">Antes</p>
            </div>
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={depois2} alt="Depois - com tapete" className="w-full h-auto" loading="lazy" decoding="async" />
              </div>
              <p className="text-center text-sm font-bold text-success">Depois</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proteção Total */}
      <section className="py-10">
        <div className="container max-w-5xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">Proteção Total</h2>
          <p className="text-muted-foreground text-sm text-center mb-2">Tapetes sob medida para cada modelo e ano</p>
          <p className="text-center text-sm font-semibold mb-8">+1.000 clientes satisfeitos ⭐</p>

          {/* Badges */}
          <div className="flex justify-center gap-3 mb-8">
            {["Nacional", "Premium", "Sob Medida"].map((badge) => (
              <span key={badge} className="bg-card border border-border rounded-full px-4 py-1.5 text-xs font-bold text-foreground">{badge}</span>
            ))}
          </div>

          {/* Detail images */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[detalhe1, detalhe2, detalhe3].map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <img src={img} alt={`Detalhe do tapete ${i + 1}`} className="w-full h-auto" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O Tapete Ideal */}
      <section className="py-10 bg-section-alt">
        <div className="container max-w-5xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">O Tapete Ideal</h2>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f} className="bg-card border border-border rounded-xl px-5 py-3.5 text-sm font-semibold text-foreground">
                  {f}
                </div>
              ))}
            </div>
            <div className="rounded-xl overflow-hidden border border-border">
              <img src={tapeteInstalado} alt="Tapete instalado no veículo" className="w-full h-auto" loading="lazy" decoding="async" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-black text-3xl md:text-4xl text-primary">{s.value}</p>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default DescriptionSection;
