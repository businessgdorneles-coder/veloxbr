import { useState, useMemo, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, Star, Truck } from "lucide-react";
import OrderReviewPopup from "@/components/OrderReviewPopup";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

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

const productImages = [prod1, foto1, prod2, prod3, prod4, prod5, prod6, prod7];

type VehicleData = Record<string, Record<string, Record<string, string[]>>>;

const vehicleTypeOptions = [
  { value: "carro", label: "Carro" },
  { value: "caminhao", label: "Caminhão" },
  { value: "outro", label: "Outro / Não encontrei meu modelo" },
];

const HeroSection = () => {
  const { trackViewContent } = useFacebookPixel();
  const [selectedKit, setSelectedKit] = useState<"interno" | "completo">("completo");
  const [currentImage, setCurrentImage] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const [vehicleType, setVehicleType] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const [customMarca, setCustomMarca] = useState("");
  const [customModelo, setCustomModelo] = useState("");
  const [customAno, setCustomAno] = useState("");
  const [customDetalhes, setCustomDetalhes] = useState("");

  const [vehicleData, setVehicleData] = useState<VehicleData>({});

  useEffect(() => {
    import("@/data/vehicleData").then((m) => setVehicleData(m.vehicleData));
  }, []);

  // Dispara ViewContent quando o produto é visualizado
  useEffect(() => {
    trackViewContent({
      content_name: 'Tapete Bandeja 3D Premium',
      content_category: 'Automotivo',
      content_ids: ['kit-completo', 'kit-interno'],
      content_type: 'product',
      currency: 'BRL',
      value: 229.90,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Steps: 1 = tipo, 2 = brand, 3 = model/year
  const currentStep = !vehicleType ? 1 : !brand ? 2 : 3;

  const brands = useMemo(() => {
    if (!vehicleType) return [];
    return Object.keys(vehicleData[vehicleType] || {}).sort();
  }, [vehicleType, vehicleData]);

  const models = useMemo(() => {
    if (!brand || !vehicleType) return [];
    return Object.keys(vehicleData[vehicleType]?.[brand] || {}).sort();
  }, [brand, vehicleType, vehicleData]);

  const years = useMemo(() => {
    if (!brand || !model || !vehicleType) return [];
    return vehicleData[vehicleType]?.[brand]?.[model] || [];
  }, [brand, model, vehicleType, vehicleData]);

  const isOutro = vehicleType === "outro";

  const handleVehicleTypeChange = (value: string) => {
    setVehicleType(value);
    setBrand("");
    setModel("");
    setYear("");
    setCustomMarca("");
    setCustomModelo("");
    setCustomAno("");
    setCustomDetalhes("");
  };
  const handleBrandChange = (value: string) => { setBrand(value); setModel(""); setYear(""); };
  const handleModelChange = (value: string) => { setModel(value); setYear(""); };

  const price = selectedKit === "interno" ? "139,90" : "229,90";
  const oldPrice = selectedKit === "interno" ? "499,00" : "599,90";
  const installment = selectedKit === "interno" ? "46,63" : "76,63";
  const savings = selectedKit === "interno" ? "R$ 359,10" : "R$ 370,00";
  const discount = selectedKit === "interno" ? "72" : "62";

  const prevImage = () => setCurrentImage((p) => (p === 0 ? productImages.length - 1 : p - 1));
  const nextImage = () => setCurrentImage((p) => (p === productImages.length - 1 ? 0 : p + 1));

  const canProceed = year || (isOutro && customMarca.trim() && customModelo.trim());

  return (
    <section id="produto" className="bg-white border-b border-gray-200 overflow-hidden">
      <div className="container max-w-6xl py-6 md:py-10 px-4">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <a href="/" className="hover:text-gray-700">Pagina inicial</a>
          <span>›</span>
          <span className="hover:text-gray-700 cursor-pointer">Todos os produtos</span>
          <span>›</span>
          <span className="text-gray-700 font-medium">TAPETE BANDEJA 3D PREMIUM</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-w-0">
          {/* LEFT: Gallery */}
          <div className="min-w-0">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white aspect-square mb-2 max-w-full">
              <img
                src={productImages[currentImage]}
                alt="Tapete Bandeja 3D Premium"
                className="w-full h-full object-contain p-4"
                loading={currentImage === 0 ? "eager" : "lazy"}
                fetchPriority={currentImage === 0 ? "high" : "auto"}
                decoding="async"
                width={600}
                height={600}
              />
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                aria-label="Próximo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mb-3">Clique para ampliar</p>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`rounded-md overflow-hidden border-2 w-16 h-16 shrink-0 transition-all ${
                    currentImage === i ? "border-green-500" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={64}
                    height={64}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-5">
            {/* Title */}
            <h1 className="font-black text-2xl md:text-3xl text-gray-900 leading-tight uppercase text-center md:text-left">
              Tapete Bandeja 3D Premium 5 Peças Incluso Porta Malas
            </h1>

            {/* ── RATING ── */}
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-bold text-sm text-gray-800">5</span>
              <span className="text-gray-400 text-sm">(647 Avaliações)</span>
            </div>

            {/* ── VEHICLE SELECTOR (top) ── */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <h3 className="font-bold text-base text-gray-900 text-center mb-1">Selecione seu Veículo</h3>
              <p className="text-green-600 text-sm text-center mb-4 font-medium">Veja se temos pronta entrega</p>

              {/* Step indicator */}
              <p className="text-gray-400 text-[11px] text-center font-semibold uppercase tracking-widest">
                PASSO {currentStep} DE 3
              </p>
              <p className="text-gray-500 text-xs text-center mb-4">
                {isOutro ? "Dados do veículo" : "Tipo de Veículo"}
              </p>

              <div className="space-y-3">
                {/* Step 1: Tipo de Veículo */}
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                    Tipo de Veículo
                  </label>
                  <div className="relative">
                    <select
                      value={vehicleType}
                      onChange={(e) => handleVehicleTypeChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none"
                    >
                      <option value="">Selecione...</option>
                      {vehicleTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* "Outro" — Modelo sob medida */}
                {isOutro && (
                  <>
                    {/* Warning banner */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3 flex gap-2">
                      <span className="text-base leading-none mt-0.5">⚠️</span>
                      <p className="text-xs text-yellow-800 leading-relaxed">
                        <strong>Modelo sob medida:</strong> Informe os dados abaixo. Após o pagamento, nosso time entrará em contato em até{" "}
                        <strong>36 horas</strong> para confirmar detalhes técnicos e garantir o encaixe perfeito.
                      </p>
                    </div>

                    {/* MARCA */}
                    <div>
                      <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                        Marca
                      </label>
                      <input
                        type="text"
                        placeholder="Digite a marca do veículo"
                        value={customMarca}
                        onChange={(e) => setCustomMarca(e.target.value)}
                        maxLength={80}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                      />
                    </div>

                    {/* MODELO */}
                    <div>
                      <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                        Modelo
                      </label>
                      <input
                        type="text"
                        placeholder="Digite o modelo do veículo"
                        value={customModelo}
                        onChange={(e) => setCustomModelo(e.target.value)}
                        maxLength={80}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                      />
                    </div>

                    {/* ANO DE FABRICAÇÃO */}
                    <div>
                      <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                        Ano de Fabricação
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 2022"
                        value={customAno}
                        onChange={(e) => setCustomAno(e.target.value)}
                        maxLength={10}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                      />
                    </div>

                    {/* CARACTERÍSTICAS / DETALHES */}
                    <div>
                      <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                        Características / Detalhes
                      </label>
                      <textarea
                        placeholder="Informe detalhes adicionais sobre o veículo (versão, câmbio, etc.)"
                        value={customDetalhes}
                        onChange={(e) => setCustomDetalhes(e.target.value)}
                        maxLength={300}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Normal flow: Montadora → Modelo → Ano */}
                {vehicleType && !isOutro && (
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                      Montadora
                    </label>
                    <div className="relative">
                      <select
                        value={brand}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none"
                      >
                        <option value="">Selecione a marca</option>
                        {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {brand && !isOutro && (
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                      Modelo
                    </label>
                    <div className="relative">
                      <select
                        value={model}
                        onChange={(e) => handleModelChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none"
                      >
                        <option value="">Selecione o modelo</option>
                        {models.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {model && !isOutro && (
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block text-gray-500 uppercase tracking-wider">
                      Ano
                    </label>
                    <div className="relative">
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none"
                      >
                        <option value="">Selecione o ano</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button inside vehicle box */}
              <button
                onClick={() => canProceed && setShowReview(true)}
                disabled={!canProceed}
                className={`mt-4 w-full font-bold py-3.5 rounded-md text-sm uppercase tracking-wide transition-all ${
                  canProceed
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {canProceed ? "CONFIRMAR MINHA ENCOMENDA →" : "SELECIONE SEU VEÍCULO ACIMA"}
              </button>


            </div>

            {/* ── PRICE ── */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <p className="text-gray-400 text-sm line-through">R$ {oldPrice}</p>
                <span className="bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">{discount}% Off</span>
              </div>
              <p className="font-black text-4xl md:text-5xl text-green-600 leading-none mb-1">
                R$ {price}
              </p>
              <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-2">
                <span>até 3x de <strong className="text-gray-700">R$ {installment}</strong></span>
                <span className="text-gray-300">•</span>
                <span className="text-green-600 font-semibold">Economia de {savings}</span>
              </p>
            </div>

            {/* ── KIT SELECTOR ── */}
            <div className="space-y-2.5">
              {/* Kit completo */}
              <button
                onClick={() => setSelectedKit("completo")}
                className={`relative w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                  selectedKit === "completo"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tr-lg rounded-bl-md">
                  -{discount}%
                </span>
                {selectedKit === "completo" ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <img src={kitCom} alt="Kit com porta malas" className="w-12 h-12 rounded-md object-cover shrink-0" loading="eager" width={48} height={48} />
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded mb-0.5">Mais Vendido</span>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight">Kit Tapetes Interno + Porta Mala</h4>
                  <p className="text-[11px] text-green-600 font-semibold">Economize R$ 370,00</p>
                </div>
                <div className="text-right shrink-0 pr-2">
                  <p className="text-gray-400 text-[11px] line-through">R$ 599,90</p>
                  <p className="font-bold text-base text-gray-900">R$ 229,90</p>
                </div>
              </button>

              {/* Kit interno */}
              <button
                onClick={() => setSelectedKit("interno")}
                className={`relative w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                  selectedKit === "interno"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tr-lg rounded-bl-md">
                  -72%
                </span>
                {selectedKit === "interno" ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <img src={kitSem} alt="Kit sem porta malas" className="w-12 h-12 rounded-md object-cover shrink-0" loading="eager" width={48} height={48} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 leading-tight">Kit Tapetes Interno Sem Porta Mala</h4>
                  <p className="text-[11px] text-green-600 font-semibold">Economize R$ 359,10</p>
                </div>
                <div className="text-right shrink-0 pr-2">
                  <p className="text-gray-400 text-[11px] line-through">R$ 499,00</p>
                  <p className="font-bold text-base text-gray-900">R$ 139,90</p>
                </div>
              </button>
            </div>

            {/* ── SHIPPING ── */}
            <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3 bg-white">
              <Truck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <span className="text-green-600 font-semibold">Frete Grátis</span> para todo o Brasil
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Entrega estimada entre <strong className="text-gray-600">7 a 15 dias úteis</strong></p>
              </div>
            </div>

            </div>
        </div>
      </div>

      <OrderReviewPopup
        open={showReview}
        onOpenChange={setShowReview}
        vehicleType={vehicleType}
        brand={isOutro ? customMarca.trim() : brand}
        model={isOutro ? customModelo.trim() : model}
        year={isOutro ? customAno.trim() : year}
        selectedColor="Preto"
        selectedKit={selectedKit}
      />
    </section>
  );
};

export default HeroSection;
