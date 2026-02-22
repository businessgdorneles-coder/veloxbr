import { useState, useMemo } from "react";
import { Check, Truck, ShieldCheck, Zap, Lock } from "lucide-react";
import { vehicleData } from "@/data/vehicleData";
import OrderReviewPopup from "@/components/OrderReviewPopup";

import prod1 from "@/assets/prod1.webp";
import foto1 from "@/assets/foto1.png";
import prod2 from "@/assets/prod2.jpg";
import prod3 from "@/assets/prod3.jpg";
import prod4 from "@/assets/prod4.png";
import prod5 from "@/assets/prod5.png";
import prod6 from "@/assets/prod6.png";
import prod7 from "@/assets/prod7.png";
import kitSem from "@/assets/kit-sem-portamalas.jpg";
import kitCom from "@/assets/kit-com-portamalas.png";
import correiosLogo from "@/assets/correios-logo.png";

const productImages = [prod1, foto1, prod2, prod3, prod4, prod5, prod6, prod7];

const colors = [
  { name: "Preto", class: "bg-[hsl(220,25%,10%)]" },
  { name: "Cinza", class: "bg-[hsl(220,10%,55%)]" },
  { name: "Bege", class: "bg-[hsl(40,40%,70%)]" },
];

const ProductSection = () => {
  const [selectedKit, setSelectedKit] = useState<"interno" | "completo">("completo");
  const [mainImage, setMainImage] = useState(prod1);
  const [selectedColor, setSelectedColor] = useState("Preto");
  const [showReview, setShowReview] = useState(false);

  const [vehicleType, setVehicleType] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const brands = useMemo(() => {
    if (!vehicleType) return [];
    return Object.keys(vehicleData[vehicleType] || {}).sort();
  }, [vehicleType]);

  const models = useMemo(() => {
    if (!vehicleType || !brand) return [];
    return Object.keys(vehicleData[vehicleType]?.[brand] || {}).sort();
  }, [vehicleType, brand]);

  const years = useMemo(() => {
    if (!vehicleType || !brand || !model) return [];
    return vehicleData[vehicleType]?.[brand]?.[model] || [];
  }, [vehicleType, brand, model]);

  const handleTypeChange = (value: string) => { setVehicleType(value); setBrand(""); setModel(""); setYear(""); };
  const handleBrandChange = (value: string) => { setBrand(value); setModel(""); setYear(""); };
  const handleModelChange = (value: string) => { setModel(value); setYear(""); };

  const price = selectedKit === "interno" ? "139,90" : "229,90";
  const oldPrice = selectedKit === "interno" ? "349,90" : "459,90";
  const installment = selectedKit === "interno" ? "48,38" : "79,50";
  const perDay = selectedKit === "interno" ? "0,38" : "0,63";
  const savings = selectedKit === "interno" ? "R$ 210,00" : "R$ 230,00";

  return (
    <section id="produto" className="py-12 md:py-24 bg-section-alt">
      <div className="container max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-10">
          {/* Selo Reclame Aqui */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-5 py-3 shadow-card">
              <img src="https://s3.amazonaws.com/rfrqimg/logo_RA_2.png" alt="Reclame Aqui" className="h-7 object-contain" loading="lazy" />
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  Reputação
                  <span className="inline-block bg-success/15 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">ÓTIMO</span>
                </p>
                <p className="text-[11px] text-muted-foreground">Nota <strong className="text-success">8.7/10</strong> · 98% resolvidos</p>
              </div>
            </div>
          </div>

          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Monte seu kit
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">
            Escolha e personalize{" "}
            <span className="text-gradient-blue">seu tapete</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Produzido sob medida para o seu veículo · Frete grátis · Entrega de 5 a 10 dias úteis
          </p>
        </div>

        {/* Kit selector — mobile: full width cards first */}
        <div className="space-y-3 mb-6">
          <h3 className="font-display font-bold text-lg text-center lg:text-left">Selecione seu kit</h3>

          {/* Kit interno */}
          <button
            onClick={() => setSelectedKit("interno")}
            className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${selectedKit === "interno" ? "border-primary bg-primary/5 shadow-blue" : "border-border bg-card hover:border-primary/40"}`}
          >
            <img src={kitSem} alt="Kit sem porta malas" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0" loading="eager" decoding="async" width={80} height={80} />
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-success text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">MELHOR PREÇO</span>
              <h4 className="font-display font-bold text-sm leading-tight">KIT INTERNO <span className="text-muted-foreground font-normal">sem porta-malas</span></h4>
              <p className="text-xs text-muted-foreground line-through">de R$ 349,90</p>
              <p className="font-display text-xl font-bold text-success">R$ 139,90</p>
              <p className="text-[10px] text-success font-semibold">Economize R$ 210,00</p>
            </div>
            {selectedKit === "interno" && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
          </button>

          {/* Kit completo */}
          <button
            onClick={() => setSelectedKit("completo")}
            className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${selectedKit === "completo" ? "border-primary bg-primary/5 shadow-blue" : "border-border bg-card hover:border-primary/40"}`}
          >
            <img src={kitCom} alt="Kit com porta malas" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0" loading="eager" decoding="async" width={80} height={80} />
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-warning text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">⭐ MAIS VENDIDO</span>
              <h4 className="font-display font-bold text-sm leading-tight">KIT COMPLETO <span className="text-primary font-bold">+ porta-malas</span></h4>
              <p className="text-xs text-muted-foreground line-through">de R$ 459,90</p>
              <p className="font-display text-xl font-bold text-success">R$ 229,90</p>
              <p className="text-[10px] text-success font-semibold">Economize R$ 230,00</p>
            </div>
            {selectedKit === "completo" && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
          </button>

          {/* Micro trust */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, label: "Garantia inclusa" },
              { icon: Truck, label: "Frete grátis" },
              { icon: Lock, label: "Pagamento seguro" },
            ].map((t) => (
              <div key={t.label} className="inline-flex items-center gap-1.5 bg-card border border-border/50 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <t.icon className="w-3 h-3 text-primary" />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Gallery — horizontal scroll on mobile */}
        <div className="mb-8 lg:hidden">
          <div className="rounded-2xl overflow-hidden border border-border/50 mb-3 bg-muted aspect-video shadow-card">
            <img src={mainImage} alt="Tapete Bandeja 3D Premium" className="w-full h-full object-cover" loading="eager" fetchPriority="high" decoding="async" width={500} height={280} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`rounded-xl overflow-hidden border-2 w-16 h-16 shrink-0 transition-all ${mainImage === img ? "border-primary shadow-blue" : "border-border/50"}`}
              >
                <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" width={64} height={64} />
              </button>
            ))}
          </div>
        </div>

        {/* Gallery desktop — side by side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="rounded-2xl overflow-hidden border border-border/50 mb-3 bg-muted aspect-square shadow-card">
              <img src={mainImage} alt="Tapete Bandeja 3D Premium" className="w-full h-full object-cover" loading="eager" fetchPriority="high" decoding="async" width={500} height={500} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`rounded-xl overflow-hidden border-2 aspect-square transition-all ${mainImage === img ? "border-primary shadow-blue" : "border-border/50 hover:border-primary/40"}`}
                >
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" width={120} height={120} />
                </button>
              ))}
            </div>
          </div>
          <div className="hidden" />
        </div>

        {/* Configurator + CTA */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-card overflow-hidden">
          {/* Price banner — gatilho de compra */}
          <div className="bg-hero-dark px-5 py-6 text-center border-b border-white/10">
            {/* Oferta limitada tag */}
            <span className="inline-block bg-warning/20 text-warning text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              🔥 Oferta por tempo limitado
            </span>

            {/* De / Por */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-white/40 text-sm line-through">R$ {oldPrice}</p>
              <span className="text-white/40 text-xs">→</span>
            </div>

            {/* Preço principal — verde vibrante para gatilho */}
            <p className="font-display font-black leading-none mb-1" style={{ fontSize: "clamp(2.8rem, 10vw, 4rem)", color: "hsl(142 71% 45%)", textShadow: "0 0 32px hsl(142 71% 45% / 0.45)" }}>
              R$ {price}
            </p>

            {/* Economia em destaque */}
            <p className="text-white/50 text-xs mb-2">ou 3x de R$ {installment} com juros</p>

            <div className="inline-flex items-center gap-1.5 bg-success/20 text-success text-xs font-bold px-3 py-1.5 rounded-full">
              <Zap className="w-3 h-3 shrink-0" />
              5% OFF no PIX — economia de {savings}
            </div>
          </div>

          <div className="p-4 md:p-8">
            <h3 className="font-display font-bold text-lg mb-1 text-center">Configure seu tapete</h3>
            <p className="text-muted-foreground text-xs text-center mb-6">Selecione seu veículo e a cor preferida</p>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-4">
              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wide">Tipo de veículo</label>
                <select value={vehicleType} onChange={(e) => handleTypeChange(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Selecione o tipo</option>
                  <option value="carro">Carro</option>
                  <option value="caminhao">Caminhão</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wide">Marca</label>
                <select value={brand} onChange={(e) => handleBrandChange(e.target.value)} disabled={!vehicleType} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">{vehicleType ? "Selecione a marca" : "Aguardando tipo..."}</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wide">Modelo</label>
                <select value={model} onChange={(e) => handleModelChange(e.target.value)} disabled={!brand} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">{brand ? "Selecione o modelo" : "Aguardando marca..."}</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wide">Ano</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} disabled={!model} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">{model ? "Selecione o ano" : "Aguardando modelo..."}</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Color */}
            <div className="max-w-lg mx-auto mb-6">
              <label className="text-xs font-bold mb-2 block text-muted-foreground uppercase tracking-wide">Cor do tapete</label>
              <div className="flex gap-3 items-center">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-9 h-9 rounded-full ${c.class} border-2 transition-all ${selectedColor === c.name ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"}`}
                    aria-label={c.name}
                  />
                ))}
                <span className="text-sm font-medium ml-1">{selectedColor}</span>
              </div>
            </div>

            {/* Summary */}
            {year && (
              <div className="max-w-lg mx-auto mb-5 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong>{brand} {model}</strong> {year} · Cor {selectedColor} · Kit {selectedKit === "interno" ? "sem" : "com"} porta-malas</span>
              </div>
            )}

            {/* CTA */}
            <div className="max-w-lg mx-auto">
              <button
                onClick={() => setShowReview(true)}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-base md:text-lg shadow-blue-lg hover:brightness-110 transition-all animate-pulse-glow"
              >
                CONFIRMAR MINHA ENCOMENDA →
              </button>
              <p className="text-xs text-muted-foreground text-center mt-2">⚡ Processo leva menos de 60 segundos</p>
            </div>
          </div>
        </div>

        {/* Shipping bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 p-4 bg-card border border-border/50 rounded-xl shadow-card">
          <div className="flex items-center gap-2">
            <img src={correiosLogo} alt="Correios" className="h-6 object-contain" />
            <span className="text-sm"><strong>Frete Grátis</strong> · 5 a 10 dias úteis</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <p className="text-sm font-semibold text-muted-foreground">
            1.638+ <span className="font-normal">clientes satisfeitos em todo o Brasil 🇧🇷</span>
          </p>
        </div>
      </div>

      <OrderReviewPopup
        open={showReview}
        onOpenChange={setShowReview}
        vehicleType={vehicleType}
        brand={brand}
        model={model}
        year={year}
        selectedColor={selectedColor}
        selectedKit={selectedKit}
      />
    </section>
  );
};

export default ProductSection;
