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

  const price = selectedKit === "interno" ? "173,93" : "263,53";
  const oldPrice = selectedKit === "interno" ? "397,93" : "485,67";
  const installment = selectedKit === "interno" ? "60,30" : "90,94";
  const perDay = selectedKit === "interno" ? "0,51" : "0,73";
  const savings = selectedKit === "interno" ? "R$ 224,00" : "R$ 222,14";

  return (
    <section id="produto" className="py-16 md:py-24 bg-section-alt">
      <div className="container max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-10">
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

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Gallery */}
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

          {/* Kit selector */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-lg">Selecione seu kit</h3>

            {/* Kit interno */}
            <button
              onClick={() => setSelectedKit("interno")}
              className={`relative w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${selectedKit === "interno" ? "border-primary bg-primary/5 shadow-blue" : "border-border bg-card hover:border-primary/40"}`}
            >
              <img src={kitSem} alt="Kit sem porta malas" className="w-20 h-20 rounded-xl object-cover shrink-0" loading="eager" decoding="async" width={80} height={80} />
              <div className="flex-1">
                <span className="inline-block bg-success text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">MELHOR PREÇO</span>
                <h4 className="font-display font-bold text-sm leading-tight">KIT INTERNO <span className="text-muted-foreground font-normal">sem porta-malas</span></h4>
                <p className="text-xs text-muted-foreground line-through mt-1">de R$ 397,93</p>
                <p className="font-display text-2xl font-bold text-primary">R$ 173,93</p>
                <p className="text-[10px] text-success font-semibold">Você economiza R$ 224,00</p>
              </div>
              {selectedKit === "interno" && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </button>

            {/* Kit completo */}
            <button
              onClick={() => setSelectedKit("completo")}
              className={`relative w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${selectedKit === "completo" ? "border-primary bg-primary/5 shadow-blue" : "border-border bg-card hover:border-primary/40"}`}
            >
              <img src={kitCom} alt="Kit com porta malas" className="w-20 h-20 rounded-xl object-cover shrink-0" loading="eager" decoding="async" width={80} height={80} />
              <div className="flex-1">
                <span className="inline-block bg-warning text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">⭐ MAIS VENDIDO</span>
                <h4 className="font-display font-bold text-sm leading-tight">KIT COMPLETO <span className="text-primary font-bold">+ porta-malas</span></h4>
                <p className="text-xs text-muted-foreground line-through mt-1">de R$ 485,67</p>
                <p className="font-display text-2xl font-bold text-primary">R$ 263,53</p>
                <p className="text-[10px] text-success font-semibold">Você economiza R$ 222,14</p>
              </div>
              {selectedKit === "completo" && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </button>

            {/* Micro trust */}
            <div className="flex flex-wrap gap-2 pt-1">
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
        </div>

        {/* Configurator + CTA */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-card overflow-hidden">
          {/* Price banner */}
          <div className="bg-hero-dark px-6 py-5 text-center border-b border-white/10">
            <p className="text-white/40 text-xs line-through mb-0.5">de R$ {oldPrice}</p>
            <p className="font-display text-5xl font-bold text-white">R$ {price}</p>
            <p className="text-white/50 text-xs mt-1">ou 3x de R$ {installment} com juros</p>
            <div className="inline-flex items-center gap-1.5 mt-2 bg-success/20 text-success text-xs font-bold px-3 py-1.5 rounded-full">
              <Zap className="w-3 h-3" />
              5% OFF pagando no PIX — economia de {savings}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h3 className="font-display font-bold text-lg mb-1 text-center">Configure seu tapete</h3>
            <p className="text-muted-foreground text-xs text-center mb-6">Selecione seu veículo e a cor preferida</p>

            <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-4">
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
