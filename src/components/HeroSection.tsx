import { useState, useMemo } from "react";
import { Check, Truck, ShieldCheck, Zap, Lock, ChevronLeft, ChevronRight } from "lucide-react";
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
import seloRA from "@/assets/selo-ra.png";

const productImages = [prod1, foto1, prod2, prod3, prod4, prod5, prod6, prod7];

const colors = [
  { name: "Preto", class: "bg-[hsl(220,25%,10%)]" },
  { name: "Cinza", class: "bg-[hsl(220,10%,55%)]" },
  { name: "Bege", class: "bg-[hsl(40,40%,70%)]" },
];

const HeroSection = () => {
  const [selectedKit, setSelectedKit] = useState<"interno" | "completo">("completo");
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Preto");
  const [showReview, setShowReview] = useState(false);

  const [vehicleType, setVehicleType] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const currentStep = !vehicleType ? 1 : !brand ? 1 : !model ? 2 : 3;

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

  const price = selectedKit === "interno" ? "128,90" : "223,80";
  const oldPrice = selectedKit === "interno" ? "499,00" : "599,90";
  const installment = selectedKit === "interno" ? "42,97" : "74,60";
  const savings = selectedKit === "interno" ? "R$ 370,10" : "R$ 376,10";
  const discount = selectedKit === "interno" ? "70" : "59";

  const prevImage = () => setCurrentImage((p) => (p === 0 ? productImages.length - 1 : p - 1));
  const nextImage = () => setCurrentImage((p) => (p === productImages.length - 1 ? 0 : p + 1));

  return (
    <section id="produto" className="bg-background border-b border-border">
      <div className="container max-w-6xl py-6 md:py-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* LEFT: Gallery */}
          <div>
            {/* Main image with arrows */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted aspect-square mb-3">
              <img
                src={productImages[currentImage]}
                alt="Tapete Bandeja 3D Premium"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={600}
                height={600}
              />
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center text-foreground hover:bg-white transition-colors" aria-label="Anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center text-foreground hover:bg-white transition-colors" aria-label="Próximo">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">
                {currentImage + 1} / {productImages.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`rounded-xl overflow-hidden border-2 w-16 h-16 shrink-0 transition-all ${currentImage === i ? "border-primary shadow-blue" : "border-border hover:border-primary/40"}`}
                >
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" width={64} height={64} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info + Configurator */}
          <div className="space-y-5">
            {/* Title */}
            <h1 className="font-display font-bold text-xl md:text-2xl xl:text-3xl text-foreground leading-tight uppercase">
              Tapete Bandeja 3D Premium 5 Peças Incluso Porta Malas
            </h1>

            {/* Vehicle Selector - Step by Step */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-display font-bold text-base text-foreground text-center mb-1">Selecione seu Veículo</h3>
              <p className="text-primary text-xs text-center mb-4 font-medium">Veja se temos pronta entrega</p>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-1 rounded-full transition-all ${step <= currentStep ? "bg-primary w-10" : "bg-border w-10"}`} />
                ))}
              </div>
              <p className="text-muted-foreground text-[10px] text-center font-bold uppercase tracking-wider mb-4">Passo {currentStep} de 3</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-muted-foreground uppercase tracking-wide">Tipo</label>
                    <select value={vehicleType} onChange={(e) => handleTypeChange(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Selecione</option>
                      <option value="carro">Carro</option>
                      <option value="caminhao">Caminhão</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-muted-foreground uppercase tracking-wide">Marca</label>
                    <select value={brand} onChange={(e) => handleBrandChange(e.target.value)} disabled={!vehicleType} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">{vehicleType ? "Selecione a marca" : "..."}</option>
                      {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-muted-foreground uppercase tracking-wide">Modelo</label>
                    <select value={model} onChange={(e) => handleModelChange(e.target.value)} disabled={!brand} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">{brand ? "Selecione o modelo" : "..."}</option>
                      {models.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-muted-foreground uppercase tracking-wide">Ano</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} disabled={!model} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">{model ? "Selecione o ano" : "..."}</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Price block */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-muted-foreground text-sm line-through">R$ {oldPrice}</p>
                <span className="bg-success text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">{discount}% Off</span>
              </div>
              <p className="font-display font-black text-4xl md:text-5xl text-success leading-none mb-1">
                R$ {price}
              </p>
              <p className="text-muted-foreground text-xs mb-2">até 3x de <strong>R$ {installment}</strong></p>
              <p className="text-success text-xs font-bold">Economia de {savings}</p>
            </div>

            {/* Kit selector */}
            <div className="space-y-2.5">
              {/* Kit completo - Mais Vendido */}
              <button
                onClick={() => setSelectedKit("completo")}
                className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${selectedKit === "completo" ? "border-success bg-success/5" : "border-border bg-card hover:border-primary/40"}`}
              >
                {selectedKit === "completo" && (
                  <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                {selectedKit !== "completo" && (
                  <div className="absolute top-3 left-3 w-5 h-5 rounded-full border-2 border-border" />
                )}
                <img src={kitCom} alt="Kit com porta malas" className="w-14 h-14 rounded-xl object-cover shrink-0 ml-6" loading="eager" width={56} height={56} />
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-success text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded mb-0.5">Mais Vendido</span>
                  <h4 className="font-display font-bold text-sm text-foreground leading-tight">Kit Tapetes Interno + Porta Mala</h4>
                  <p className="text-[10px] text-success font-semibold">Economize R$ 376,10</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-destructive text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">-59%</span>
                  <p className="text-muted-foreground text-[10px] line-through mt-0.5">R$ 599,90</p>
                  <p className="font-display font-bold text-base text-success">R$ 223,80</p>
                </div>
              </button>

              {/* Kit interno */}
              <button
                onClick={() => setSelectedKit("interno")}
                className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${selectedKit === "interno" ? "border-success bg-success/5" : "border-border bg-card hover:border-primary/40"}`}
              >
                {selectedKit === "interno" && (
                  <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                {selectedKit !== "interno" && (
                  <div className="absolute top-3 left-3 w-5 h-5 rounded-full border-2 border-border" />
                )}
                <img src={kitSem} alt="Kit sem porta malas" className="w-14 h-14 rounded-xl object-cover shrink-0 ml-6" loading="eager" width={56} height={56} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-foreground leading-tight">Kit Tapetes Interno Sem Porta Mala</h4>
                  <p className="text-[10px] text-success font-semibold">Economize R$ 370,10</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-destructive text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">-70%</span>
                  <p className="text-muted-foreground text-[10px] line-through mt-0.5">R$ 499,00</p>
                  <p className="font-display font-bold text-base text-success">R$ 128,90</p>
                </div>
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowReview(true)}
              className={`w-full font-bold py-4 rounded-xl text-base transition-all ${year ? "bg-primary text-primary-foreground hover:brightness-110 shadow-blue-lg animate-pulse-glow" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
              disabled={!year}
            >
              {year ? "CONFIRMAR MINHA ENCOMENDA →" : "SELECIONE SEU VEÍCULO ACIMA"}
            </button>

            {/* Reclame Aqui badge + Trust */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="inline-flex items-center gap-2.5 bg-card border border-border rounded-2xl px-4 py-2.5">
                <img src={seloRA} alt="Reclame Aqui" className="h-8 w-8 object-contain shrink-0" width={32} height={32} />
                <div className="w-px h-7 bg-border shrink-0" />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-foreground leading-tight">Reclame Aqui</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    <strong className="text-success">8.7</strong>/10 · <span className="text-success font-semibold">Ótimo</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: ShieldCheck, label: "Garantia" },
                  { icon: Truck, label: "Frete grátis" },
                  { icon: Lock, label: "Seguro" },
                ].map((t) => (
                  <div key={t.label} className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                    <t.icon className="w-3 h-3 text-primary" />
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <label className="text-[10px] font-bold mb-2 block text-muted-foreground uppercase tracking-wide">Cor do tapete</label>
              <div className="flex gap-3 items-center">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full ${c.class} border-2 transition-all ${selectedColor === c.name ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"}`}
                    aria-label={c.name}
                  />
                ))}
                <span className="text-sm font-medium text-muted-foreground ml-1">{selectedColor}</span>
              </div>
            </div>

            {/* Summary */}
            {year && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong>{brand} {model}</strong> {year} · Cor {selectedColor} · Kit {selectedKit === "interno" ? "sem" : "com"} porta-malas</span>
              </div>
            )}
          </div>
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

export default HeroSection;
