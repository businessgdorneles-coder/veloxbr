import { useState, useMemo } from "react";
import { Check, Truck } from "lucide-react";
import { vehicleData, VehicleType } from "@/data/vehicleData";
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

const ProductSection = () => {
  const [selectedKit, setSelectedKit] = useState<"interno" | "completo">("completo");
  const [mainImage, setMainImage] = useState(prod1);
  const [selectedColor, setSelectedColor] = useState("Preto");
  const [showReview, setShowReview] = useState(false);

  // Vehicle selectors
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

  const handleTypeChange = (value: string) => {
    setVehicleType(value);
    setBrand("");
    setModel("");
    setYear("");
  };

  const handleBrandChange = (value: string) => {
    setBrand(value);
    setModel("");
    setYear("");
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    setYear("");
  };

  const colors = [
    { name: "Preto", class: "bg-foreground" },
    { name: "Cinza", class: "bg-muted-foreground" },
    { name: "Bege", class: "bg-[hsl(40,40%,70%)]" },
  ];

  return (
    <section id="produto" className="py-16 md:py-24">
      <div className="container max-w-5xl">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-2">
          Monte seu kit <span className="text-gradient-blue">sob medida</span>
        </h2>
        <p className="text-muted-foreground text-center mb-10 text-sm">
          Produzido sob medida para o seu veículo • Envio rápido
        </p>

        {/* Product Gallery */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="rounded-xl overflow-hidden border border-border/50 mb-3 bg-muted aspect-square">
              <img src={mainImage} alt="Tapete Bandeja 3D Premium" className="w-full h-full object-cover" loading="lazy" decoding="async" width={500} height={500} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`rounded-lg overflow-hidden border-2 aspect-square transition-all ${
                    mainImage === img ? "border-primary" : "border-border/50 hover:border-primary/40"
                  }`}
                >
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" width={120} height={120} />
                </button>
              ))}
            </div>
          </div>

          {/* Kit Selection */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg">Escolha seu kit</h3>
            <p className="text-muted-foreground text-sm mb-4">Depois escolha o veículo e a cor no painel abaixo.</p>

            <button
              onClick={() => setSelectedKit("interno")}
              className={`relative w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                selectedKit === "interno"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <img src={kitSem} alt="Kit sem porta malas" className="w-20 h-20 rounded-lg object-cover shrink-0" loading="lazy" decoding="async" width={80} height={80} />
              <div className="flex-1">
                <span className="inline-block bg-success text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-1">MELHOR PREÇO</span>
                <h4 className="font-display font-bold text-sm">KIT TAPETES INTERNO <span className="text-muted-foreground font-normal">SEM PORTA MALAS</span></h4>
                <p className="text-xs text-muted-foreground line-through">R$ 397,93</p>
                <p className="font-display text-xl font-bold text-primary">R$ 173,93</p>
                <p className="text-xs text-muted-foreground">Economize R$ 224,00</p>
              </div>
              {selectedKit === "interno" && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedKit("completo")}
              className={`relative w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                selectedKit === "completo"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <img src={kitCom} alt="Kit com porta malas" className="w-20 h-20 rounded-lg object-cover shrink-0" loading="lazy" decoding="async" width={80} height={80} />
              <div className="flex-1">
                <span className="inline-block bg-warning text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-1">MAIS VENDIDO</span>
                <h4 className="font-display font-bold text-sm">KIT TAPETES INTERNO <span className="text-primary font-bold">+ PORTA MALAS</span></h4>
                <p className="text-xs text-muted-foreground line-through">R$ 485,67</p>
                <p className="font-display text-xl font-bold text-primary">R$ 263,53</p>
                <p className="text-xs text-muted-foreground">Economize R$ 222,14</p>
              </div>
              {selectedKit === "completo" && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Price Summary & Configurator */}
        <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 text-center mb-8">
          <p className="text-muted-foreground text-sm line-through mb-1">
            de R$ {selectedKit === "interno" ? "397,93" : "485,67"}
          </p>
          <p className="font-display text-4xl md:text-5xl font-bold text-primary mb-1">
            R$ {selectedKit === "interno" ? "173,93" : "263,53"}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            💡 Apenas R$ {selectedKit === "interno" ? "0,51" : "0,73"} por dia — Proteção premium pelo preço de um café ☕
          </p>

          <h3 className="font-display font-bold text-lg mb-4">Monte seu tapete sob medida</h3>
          <p className="text-muted-foreground text-sm mb-4">Selecione as opções abaixo:</p>

          <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-4 text-left">
            {/* Tipo */}
            <div>
              <label className="text-xs font-semibold mb-1 block">Tipo de veículo</label>
              <select
                value={vehicleType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background"
              >
                <option value="">Selecione o tipo</option>
                <option value="carro">Carro</option>
                <option value="caminhao">Caminhão</option>
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="text-xs font-semibold mb-1 block">Marca</label>
              <select
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                disabled={!vehicleType}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background disabled:opacity-50"
              >
                <option value="">{vehicleType ? "Selecione a marca" : "Aguardando tipo..."}</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div>
              <label className="text-xs font-semibold mb-1 block">Modelo</label>
              <select
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={!brand}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background disabled:opacity-50"
              >
                <option value="">{brand ? "Selecione o modelo" : "Aguardando marca..."}</option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Ano */}
            <div>
              <label className="text-xs font-semibold mb-1 block">Ano</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={!model}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background disabled:opacity-50"
              >
                <option value="">{model ? "Selecione o ano" : "Aguardando modelo..."}</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color selector */}
          <div className="max-w-lg mx-auto mb-6">
            <label className="text-xs font-semibold mb-2 block text-left">Escolha a cor</label>
            <div className="flex gap-3 items-center">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-10 h-10 rounded-full ${c.class} border-2 transition-all ${
                    selectedColor === c.name ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"
                  }`}
                  aria-label={c.name}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">{selectedColor}</span>
            </div>
          </div>

          {/* Summary */}
          {year && (
            <div className="max-w-lg mx-auto mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-left">
              <strong>Resumo:</strong> {brand} {model} ({year}) • Cor {selectedColor} • Kit {selectedKit === "interno" ? "sem" : "com"} porta-malas
            </div>
          )}

          <button
            onClick={() => setShowReview(true)}
            className="w-full max-w-lg bg-primary text-primary-foreground font-bold py-4 rounded-lg text-base md:text-lg shadow-blue hover:brightness-110 transition-all"
          >
            CONFIRMAR MINHA ENCOMENDA
          </button>
          <p className="text-xs text-muted-foreground mt-2">leva menos de 60 segundos</p>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <img src={correiosLogo} alt="Correios" className="h-6 object-contain" />
          <span><strong>Frete Grátis</strong> • Entrega estimada entre 5 a 10 dias úteis</span>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm font-semibold">1638+ <span className="text-muted-foreground font-normal">Clientes satisfeitos em todo o Brasil</span></p>
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
