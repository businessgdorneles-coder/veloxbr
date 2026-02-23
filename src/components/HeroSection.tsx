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

  // Step tracking
  const currentStep = !vehicleType ? 1 : !brand ? 1 : !model ? 2 : !year ? 3 : 3;

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
  const savings = selectedKit === "interno" ? "R$ 210,00" : "R$ 230,00";
  const discount = selectedKit === "interno" ? "60" : "50";

  const prevImage = () => setCurrentImage((p) => (p === 0 ? productImages.length - 1 : p - 1));
  const nextImage = () => setCurrentImage((p) => (p === productImages.length - 1 ? 0 : p + 1));

  return (
    <section id="produto" className="bg-hero-dark">
      <div className="container max-w-6xl py-6 md:py-12">
        {/* Title - mobile only */}
        <h1 className="lg:hidden font-display font-bold text-xl text-white mb-4 leading-tight">
          TAPETE BANDEJA 3D PREMIUM — SOB MEDIDA PARA SEU VEÍCULO
        </h1>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* LEFT: Gallery */}
          <div>
            {/* Main image with arrows */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-square mb-3">
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
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors" aria-label="Anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors" aria-label="Próximo">
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                {currentImage + 1} / {productImages.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`rounded-xl overflow-hidden border-2 w-16 h-16 shrink-0 transition-all ${currentImage === i ? "border-primary shadow-blue" : "border-white/10 hover:border-white/30"}`}
                >
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" width={64} height={64} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info + Configurator */}
          <div className="space-y-5">
            {/* Title - desktop only */}
            <h1 className="hidden lg:block font-display font-bold text-2xl xl:text-3xl text-white leading-tight">
              TAPETE BANDEJA 3D PREMIUM — SOB MEDIDA PARA SEU VEÍCULO
            </h1>

            {/* Reclame Aqui badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
              <img src={seloRA} alt="Reclame Aqui" className="h-8 w-8 object-contain shrink-0" width={32} height={32} />
              <div className="w-px h-7 bg-white/20 shrink-0" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-white leading-tight">Reclame Aqui</p>
                <p className="text-[10px] text-white/60 leading-tight">
                  <strong className="text-success">8.7</strong>/10 · <span className="text-success font-semibold">Ótimo</span>
                </p>
              </div>
            </div>

            {/* Vehicle Selector - Step by Step */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-display font-bold text-base text-white text-center mb-1">Selecione seu Veículo</h3>
              <p className="text-white/40 text-xs text-center mb-4">Veja se temos pronta entrega</p>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${step <= currentStep ? "bg-primary w-8" : "bg-white/15 w-8"}`} />
                    </div>
                  ))}
                </div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-2">Passo {currentStep} de 3</span>
              </div>

              <div className="space-y-3">
                {/* Type + Brand */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-white/50 uppercase tracking-wide">Tipo</label>
                    <select value={vehicleType} onChange={(e) => handleTypeChange(e.target.value)} className="w-full border border-white/15 rounded-xl px-3 py-2.5 text-sm bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="" className="bg-[hsl(220,40%,10%)]">Selecione</option>
                      <option value="carro" className="bg-[hsl(220,40%,10%)]">Carro</option>
                      <option value="caminhao" className="bg-[hsl(220,40%,10%)]">Caminhão</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-white/50 uppercase tracking-wide">Marca</label>
                    <select value={brand} onChange={(e) => handleBrandChange(e.target.value)} disabled={!vehicleType} className="w-full border border-white/15 rounded-xl px-3 py-2.5 text-sm bg-white/5 text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="" className="bg-[hsl(220,40%,10%)]">{vehicleType ? "Selecione" : "..."}</option>
                      {brands.map((b) => <option key={b} value={b} className="bg-[hsl(220,40%,10%)]">{b}</option>)}
                    </select>
                  </div>
                </div>
                {/* Model + Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-white/50 uppercase tracking-wide">Modelo</label>
                    <select value={model} onChange={(e) => handleModelChange(e.target.value)} disabled={!brand} className="w-full border border-white/15 rounded-xl px-3 py-2.5 text-sm bg-white/5 text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="" className="bg-[hsl(220,40%,10%)]">{brand ? "Selecione" : "..."}</option>
                      {models.map((m) => <option key={m} value={m} className="bg-[hsl(220,40%,10%)]">{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-white/50 uppercase tracking-wide">Ano</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} disabled={!model} className="w-full border border-white/15 rounded-xl px-3 py-2.5 text-sm bg-white/5 text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="" className="bg-[hsl(220,40%,10%)]">{model ? "Selecione" : "..."}</option>
                      {years.map((y) => <option key={y} value={y} className="bg-[hsl(220,40%,10%)]">{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Price block */}
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-1">
                <p className="text-white/40 text-sm line-through">R$ {oldPrice}</p>
                <span className="bg-success text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% Off</span>
              </div>
              <p className="font-display font-black text-4xl md:text-5xl text-success leading-none mb-1">
                R$ {price}
              </p>
              <p className="text-white/50 text-xs mb-2">até 3x de R$ {installment}</p>
              <div className="inline-flex items-center gap-1.5 bg-success/15 text-success text-xs font-bold px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3 shrink-0" />
                Economia de {savings}
              </div>
            </div>

            {/* Kit selector */}
            <div className="space-y-2.5">
              {/* Kit completo */}
              <button
                onClick={() => setSelectedKit("completo")}
                className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${selectedKit === "completo" ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
              >
                {selectedKit === "completo" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
                <img src={kitCom} alt="Kit com porta malas" className="w-14 h-14 rounded-xl object-cover shrink-0" loading="eager" width={56} height={56} />
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-warning text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full mb-0.5">⭐ MAIS VENDIDO</span>
                  <h4 className="font-display font-bold text-sm text-white leading-tight">Kit Tapetes Interno + Porta Mala</h4>
                  <p className="text-[10px] text-success font-semibold">Economize R$ 230,00</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-destructive text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">-{discount}%</span>
                  <p className="text-white/40 text-[10px] line-through mt-0.5">R$ 459,90</p>
                  <p className="font-display font-bold text-base text-success">R$ 229,90</p>
                </div>
              </button>

              {/* Kit interno */}
              <button
                onClick={() => setSelectedKit("interno")}
                className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${selectedKit === "interno" ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
              >
                {selectedKit === "interno" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
                <img src={kitSem} alt="Kit sem porta malas" className="w-14 h-14 rounded-xl object-cover shrink-0" loading="eager" width={56} height={56} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-white leading-tight">Kit Tapetes Interno Sem Porta Mala</h4>
                  <p className="text-[10px] text-success font-semibold">Economize R$ 210,00</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-destructive text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">-60%</span>
                  <p className="text-white/40 text-[10px] line-through mt-0.5">R$ 349,90</p>
                  <p className="font-display font-bold text-base text-success">R$ 139,90</p>
                </div>
              </button>
            </div>

            {/* Color */}
            <div>
              <label className="text-[10px] font-bold mb-2 block text-white/50 uppercase tracking-wide">Cor do tapete</label>
              <div className="flex gap-3 items-center">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full ${c.class} border-2 transition-all ${selectedColor === c.name ? "border-primary ring-2 ring-primary/30 scale-110" : "border-white/20"}`}
                    aria-label={c.name}
                  />
                ))}
                <span className="text-sm font-medium text-white/70 ml-1">{selectedColor}</span>
              </div>
            </div>

            {/* Summary */}
            {year && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-sm flex items-start gap-2 text-white">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong>{brand} {model}</strong> {year} · Cor {selectedColor} · Kit {selectedKit === "interno" ? "sem" : "com"} porta-malas</span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => setShowReview(true)}
              className={`w-full font-bold py-4 rounded-xl text-base shadow-blue-lg transition-all ${year ? "bg-primary text-primary-foreground hover:brightness-110 animate-pulse-glow" : "bg-white/10 text-white/40 cursor-not-allowed"}`}
              disabled={!year}
            >
              {year ? "CONFIRMAR MINHA ENCOMENDA →" : "SELECIONE SEU VEÍCULO ACIMA"}
            </button>

            {/* Micro trust */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {[
                { icon: ShieldCheck, label: "Garantia inclusa" },
                { icon: Truck, label: "Frete grátis" },
                { icon: Lock, label: "Pagamento seguro" },
              ].map((t) => (
                <div key={t.label} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-white/60">
                  <t.icon className="w-3 h-3 text-primary" />
                  {t.label}
                </div>
              ))}
            </div>
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
