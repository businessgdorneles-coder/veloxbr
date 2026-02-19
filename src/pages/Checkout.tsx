import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ChevronRight, Star, ShieldCheck } from "lucide-react";
import prod1 from "@/assets/prod1.webp";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state as {
    brand?: string;
    model?: string;
    year?: string;
    vehicleType?: string;
    selectedColor?: string;
    selectedKit?: string;
    selectedTexture?: string;
  } | null;

  // Countdown timer (12 minutes)
  const [timeLeft, setTimeLeft] = useState(12 * 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `00:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Steps
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");

  const kitLabel = orderData?.selectedKit === "completo"
    ? "Kit Tapetes Internos Bandeja + Porta-Malas"
    : "Kit Tapetes Internos Bandeja";
  const price = orderData?.selectedKit === "completo" ? "263,53" : "173,93";
  const colorLabel = orderData?.selectedColor || "Preto";

  const testimonials = [
    { name: "Pedro Álvares", text: "Foi minha primeira compra na CarpetCar para revender e fiquei muito satisfeito. Produtos de ótima qualidade." },
    { name: "Marco da Silva", text: "Já é minha segunda compra na CarpetCar e recomendo muito. O carpete veio sob medida e encaixou perfeito." },
    { name: "Tulio Vasconcelos", text: "Excelente experiência com a CarpetCar. Produto igual ao anúncio e acabamento impecável." },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border py-3">
        <div className="container flex items-center justify-between max-w-6xl">
          <h1 className="font-display text-xl font-bold text-primary">CARPETCAR</h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-4 h-4" />
            <div className="text-right">
              <p className="font-bold text-foreground text-xs">PAGAMENTO</p>
              <p className="text-[10px]">100% SEGURO</p>
            </div>
          </div>
        </div>
      </header>

      {/* Security bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4" />
        COMPRA SEGURA
        <Lock className="w-3.5 h-3.5 mx-1" />
        SITE 100% PROTEGIDO
      </div>

      {/* Timer */}
      <div className="text-center py-4">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full mr-2 font-semibold uppercase">Tempo restante</span>
        <span className="font-display text-2xl font-bold text-foreground">{formatTime(timeLeft)}</span>
      </div>

      {/* Main layout */}
      <div className="container max-w-6xl pb-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left - Form Steps */}
          <div className="space-y-4">
            {/* Step 1 - Informações pessoais */}
            <div className={`bg-background rounded-xl border border-border p-6 ${currentStep !== 1 && "opacity-60"}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</span>
                <h2 className="font-display font-bold text-lg">Identifique-se</h2>
              </div>
              {currentStep === 1 ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Utilizaremos seu e-mail para: identificar seu perfil, histórico de compra, notificação de pedidos e carrinho de compras.</p>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Nome completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ex.: Maria de Almeida Cruz"
                      className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Celular / Whatsapp</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background"
                    />
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-success text-primary-foreground font-bold py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{name || "—"} • {email || "—"}</p>
                  <button onClick={() => setCurrentStep(1)} className="text-primary text-sm font-semibold">Editar</button>
                </div>
              )}
            </div>

            {/* Step 2 - Entrega */}
            <div className={`bg-background rounded-xl border border-border p-6 ${currentStep !== 2 && "opacity-60"}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
                <h2 className="font-display font-bold text-lg">Entrega</h2>
              </div>
              {currentStep === 2 ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Preencha seu endereço para calcularmos o frete.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-sm font-semibold block mb-1">CEP</label>
                      <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Endereço</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, Avenida..." className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1">Número</label>
                      <input value={number} onChange={(e) => setNumber(e.target.value)} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Complemento</label>
                      <input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Bairro</label>
                    <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1">Cidade</label>
                      <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Estado</label>
                      <input value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full bg-success text-primary-foreground font-bold py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : currentStep > 2 ? (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{address}, {number} - {city}/{state}</p>
                  <button onClick={() => setCurrentStep(2)} className="text-primary text-sm font-semibold">Editar</button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Preencha suas informações pessoais para continuar</p>
              )}
            </div>

            {/* Step 3 - Pagamento */}
            <div className={`bg-background rounded-xl border border-border p-6 ${currentStep !== 3 && "opacity-60"}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</span>
                <h2 className="font-display font-bold text-lg">Pagamento</h2>
              </div>
              {currentStep === 3 ? (
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentMethod("pix")}
                      className={`flex-1 border-2 rounded-lg py-3 text-sm font-bold transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      PIX
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 border-2 rounded-lg py-3 text-sm font-bold transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      Cartão de Crédito
                    </button>
                  </div>
                  {paymentMethod === "pix" ? (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Ao confirmar, um QR Code PIX será gerado para pagamento.</p>
                      <p className="text-xs text-muted-foreground">Pagamento instantâneo • Aprovação imediata</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold block mb-1">Número do cartão</label>
                        <input placeholder="0000 0000 0000 0000" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold block mb-1">Validade</label>
                          <input placeholder="MM/AA" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold block mb-1">CVV</label>
                          <input placeholder="123" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-1">Nome no cartão</label>
                        <input placeholder="Como está no cartão" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" />
                      </div>
                    </div>
                  )}
                  <button className="w-full bg-success text-primary-foreground font-bold py-4 rounded-lg text-base flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                    Finalizar compra
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Preencha suas informações pessoais para continuar</p>
              )}
            </div>
          </div>

          {/* Right - Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border p-6">
              <h3 className="font-display font-bold text-lg mb-4 uppercase">Resumo</h3>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">Produto</span>
                <span>R$ {price}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 border-b border-border pb-4">
                <span className="font-semibold text-success">Total</span>
                <span className="font-bold text-success text-lg">R$ {price}</span>
              </div>
              <div className="flex gap-3 items-start">
                <img src={prod1} alt="Produto" className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{kitLabel} – {colorLabel}</p>
                  <p className="text-xs text-muted-foreground mt-1">Qtd.: 1 &nbsp; R$ {price}</p>
                  {orderData?.brand && (
                    <p className="text-xs text-muted-foreground mt-1">{orderData.brand} {orderData.model} ({orderData.year})</p>
                  )}
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-background rounded-xl border border-border p-6 space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className={`${i > 0 ? "border-t border-border pt-4" : ""}`}>
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">"{t.text}"</p>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Formas de pagamento</p>
              <p className="text-xs text-muted-foreground">PIX • Cartão de Crédito • Boleto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
