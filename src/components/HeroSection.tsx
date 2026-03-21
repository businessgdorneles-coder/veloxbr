import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, BadgeCheck, Star } from "lucide-react";
import OrderReviewPopup from "@/components/OrderReviewPopup";

import prod1 from "@/assets/prod1.webp";
import foto1 from "@/assets/foto1.webp";
import prod2 from "@/assets/prod2.webp";
import prod3 from "@/assets/prod3.webp";
import prod4 from "@/assets/prod4.png";
import prod5 from "@/assets/prod5.png";
import prod6 from "@/assets/prod6.png";
import prod7 from "@/assets/prod7.png";
import kitSem from "@/assets/kit-sem-portamalas.webp";
import kitCom from "@/assets/kit-com-portamalas.webp";
import seloRA from "@/assets/selo-ra.webp";

const productImages = [prod1, foto1, prod2, prod3, prod4, prod5, prod6, prod7];

type VehicleData = Record<string, Record<string, Record<string, string[]>>>;

const HeroSection = () => {
  const [selectedKit, setSelectedKit] = useState<"interno" | "completo">("completo");
  const [currentImage, setCurrentImage] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const [customVehicle, setCustomVehicle] = useState(false);
  const [customModel, setCustomModel] = useState("");
  const [customYear, setCustomYear] = useState("");

  const [selectedColor, setSelectedColor] = useState<string>("Preto");
  const colors = ["Preto", "Bege", "Cinza", "Marrom"];

  const [vehicleData, setVehicleData] = useState<VehicleData>({});

  useEffect(() => {
    import("@/data/vehicleData").then((m) => setVehicleData(m.vehicleData));
  }, []);

  // Default to "carro" since reference doesn't show type selector
  const vehicleType = "carro";

  const currentStep = !brand ? 1 : !model ? 2 : 3;

  const brands = useMemo(() => {
    return Object.keys(vehicleData[vehicleType] || {}).sort();
  }, [vehicleData]);

  const models = useMemo(() => {
    if (!brand) return [];
    return Object.keys(vehicleData[vehicleType]?.[brand] || {}).sort();
  }, [brand, vehicleData]);

  const years = useMemo(() => {
    if (!brand || !model) return [];
    return vehicleData[vehicleType]?.[brand]?.[model] || [];
  }, [brand, model, vehicleData]);

  const handleBrandChange = (value: string) => { setBrand(value); setModel(""); setYear(""); };
  const handleModelChange = (value: string) => { setModel(value); setYear(""); };

  const price = selectedKit === "interno" ? "139,90" : "229,90";
  const oldPrice = selectedKit === "interno" ? "499,00" : "599,90";
  const installment = selectedKit === "interno" ? "46,63" : "76,63";
  const savings = selectedKit === "interno" ? "R$ 359,10" : "R$ 370,00";
  const discount = selectedKit === "interno" ? "72" : "62";

  const prevImage = () => setCurrentImage((p) => (p === 0 ? productImages.length - 1 : p - 1));
  const nextImage = () => setCurrentImage((p) => (p === productImages.length - 1 ? 0 : p + 1));

  return (
    <section id="produto" className="bg-background border-b border-border overflow-hidden">
      <div className="container max-w-6xl py-6 md:py-10 px-4">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 min-w-0">
          {/* LEFT: Gallery */}
          <div className="min-w-0">
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted aspect-square mb-3 max-w-full">
              <img
                src={productImages[currentImage]}
                alt="Tapete Bandeja 3D Premium"
                className="w-full h-full object-cover"
                loading={currentImage === 0 ? "eager" : "lazy"}
                fetchPriority={currentImage === 0 ? "high" : "auto"}
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
                  className={`rounded-xl overflow-hidden border-2 w-16 h-16 shrink-0 transition-all ${currentImage === i ? "border-success shadow-blue" : "border-border hover:border-primary/40"}`}
                >
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" width={64} height={64} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-5">
            <div>
              <h1 className="font-bold text-lg md:text-2xl xl:text-3xl text-foreground leading-tight inline break-words" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Tapete Bandeja 3D Premium 5 Peças Incluso Porta Malas
              </h1>
              <BadgeCheck className="inline-block w-5 h-5 md:w-6 md:h-6 text-success ml-2 align-middle -mt-1" />
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                  ))}
                </div>
                <span className="text-warning text-sm font-bold">(4.8)</span>
                <span className="text-warning text-sm">647 avaliações</span>
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
              {/* Kit completo */}
              <button
                onClick={() => setSelectedKit("completo")}
                className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${selectedKit === "completo" ? "border-success bg-success/5" : "border-border bg-card hover:border-success/40"}`}
              >
                {selectedKit === "completo" ? (
                  <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
                )}
                <img src={kitCom} alt="Kit com porta malas" className="w-14 h-14 rounded-xl object-cover shrink-0" loading="eager" width={56} height={56} />
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-success text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded mb-0.5">Mais Vendido</span>
                  <h4 className="font-display font-bold text-sm text-foreground leading-tight">Kit Tapetes Interno + Porta Mala</h4>
                  <p className="text-[10px] text-success font-semibold">Economize R$ 370,00</p>
                </div>
                <div className="text-right shrink-0">
                 <span className="bg-destructive text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">-62%</span>
                  <p className="text-muted-foreground text-[10px] line-through mt-0.5">R$ 599,90</p>
                  <p className="font-display font-bold text-base text-success">R$ 229,90</p>
                </div>
              </button>

              {/* Kit interno */}
              <button
                onClick={() => setSelectedKit("interno")}
                className={`relative w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${selectedKit === "interno" ? "border-success bg-success/5" : "border-border bg-card hover:border-success/40"}`}
              >
                {selectedKit === "interno" ? (
                  <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
                )}
                <img src={kitSem} alt="Kit sem porta malas" className="w-14 h-14 rounded-xl object-cover shrink-0" loading="eager" width={56} height={56} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-foreground leading-tight">Kit Tapetes Interno Sem Porta Mala</h4>
                  <p className="text-[10px] text-success font-semibold">Economize R$ 359,10</p>
                </div>
                <div className="text-right shrink-0">
                 <span className="bg-destructive text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">-72%</span>
                  <p className="text-muted-foreground text-[10px] line-through mt-0.5">R$ 499,00</p>
                  <p className="font-display font-bold text-base text-success">R$ 139,90</p>
                </div>
              </button>
            </div>

            {/* Vehicle Selector - Sequential Steps */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-display font-bold text-base text-foreground text-center mb-1">Selecione seu Veículo</h3>
              <p className="text-success text-xs text-center mb-4 font-medium">Veja se temos pronta entrega</p>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-1 rounded-full transition-all ${step <= currentStep ? "bg-success w-10" : "bg-border w-10"}`} />
                ))}
              </div>
              <p className="text-muted-foreground text-[10px] text-center font-bold uppercase tracking-wider mb-4">Passo {currentStep} de 3</p>

              <div className="space-y-3">
                {/* Step 1: Montadora */}
                <div>
                  <label className="text-[10px] font-bold mb-1 block text-muted-foreground uppercase tracking-wide text-center">Montadora</label>
                  <select value={brand} onChange={(e) => handleBrandChange(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-success/30">
                    <option value="">Selecione a marca</option>
                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Step 2: Modelo (shown after brand) */}
                {brand && (
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-muted-foreground uppercase tracking-wide text-center">Modelo</label>
                    <select value={model} onChange={(e) => handleModelChange(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-success/30">
                      <option value="">Selecione o modelo</option>
                      {models.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}

                {/* Step 3: Ano (shown after model) */}
                {model && (
                  <div>
                    <label className="text-[10px] font-bold mb-1 block text-muted-foreground uppercase tracking-wide text-center">Ano</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-success/30">
                      <option value="">Selecione o ano</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Custom vehicle toggle */}
              <div className="mt-4 pt-3 border-t border-border text-center">
                <button
                  type="button"
                  onClick={() => { if (!customVehicle) { setBrand(""); setModel(""); setYear(""); } setCustomVehicle(!customVehicle); }}
                  className="text-xs text-warning font-semibold underline underline-offset-2 hover:brightness-110 transition-all"
                >
                  Não encontrou seu veículo? Clique aqui
                </button>
                {customVehicle && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Ex: Fiat Pulse Drive 2024"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      maxLength={100}
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-success/30"
                    />
                    <input
                      type="text"
                      placeholder="Ano do veículo"
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      maxLength={10}
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-success/30"
                    />
                    <p className="text-[10px] text-muted-foreground text-center">Confeccionaremos os carpetes sob medida para o seu modelo.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selo Reclame Aqui */}
            <div className="flex items-center justify-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
              <img src={seloRA} alt="Selo Reclame Aqui" className="h-8 object-contain" loading="eager" width={32} height={32} />
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm text-foreground">8.7/10</span>
                  <span className="bg-success text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">Ótimo</span>
                </div>
                <p className="text-[10px] text-muted-foreground">+5.000 clientes satisfeitos</p>
              </div>
            </div>

            {/* CTA */}
            {/* Color selector */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-display font-bold text-sm text-foreground mb-3">Cor do Tapete</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const colorMap: Record<string, string> = {
                    Preto: "bg-gray-900",
                    Bege: "bg-amber-200",
                    Cinza: "bg-gray-400",
                    Marrom: "bg-amber-800",
                  };
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${selectedColor === color ? "border-success bg-success/5 text-foreground" : "border-border text-muted-foreground hover:border-success/40"}`}
                    >
                      <span className={`w-4 h-4 rounded-full ${colorMap[color]} shrink-0 border border-border/50`} />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const canProceed = year || (customVehicle && customModel.trim() && customYear.trim());
              return (
                <button
                  onClick={() => setShowReview(true)}
                  className={`w-full font-bold py-4 rounded-xl text-base transition-all ${canProceed ? "bg-primary text-primary-foreground hover:brightness-110 shadow-blue-lg animate-pulse-glow" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                  disabled={!canProceed}
                >
                  {canProceed ? "CONFIRMAR MINHA ENCOMENDA →" : "SELECIONE SEU VEÍCULO ACIMA"}
                </button>
              );
            })()}

          </div>
        </div>
      </div>

      <OrderReviewPopup
        open={showReview}
        onOpenChange={setShowReview}
        vehicleType={vehicleType}
        brand={customVehicle ? customModel.trim() : brand}
        model={customVehicle ? customModel.trim() : model}
        year={customVehicle ? customYear.trim() : year}
        selectedColor={selectedColor}
        selectedKit={selectedKit}
      />
    </section>
  );
};

export default HeroSection;
