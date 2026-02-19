import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ChevronRight, Star, ShieldCheck, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import prod1 from "@/assets/prod1.webp";
import checkoutBanner from "@/assets/checkout-banner.png";

// Will be fetched from backend

declare global {
  interface Window {
    BeehivePay?: {
      setPublicKey: (key: string) => void;
      setTestMode: (test: boolean) => void;
      encrypt: (card: {
        number: string;
        holderName: string;
        expMonth: number;
        expYear: number;
        cvv: string;
      }) => Promise<string>;
    };
  }
}

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

  // Load Beehive tokenization script
  useEffect(() => {
    if (!document.querySelector('script[src*="paybeehive"]')) {
      const script = document.createElement("script");
      script.src = "https://api.conta.paybeehive.com.br/v1/js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fetch Beehive public key
  useEffect(() => {
    supabase.functions.invoke("beehive-public-key").then(({ data }) => {
      if (data?.publicKey) setBeehivePublicKey(data.publicKey);
    });
  }, []);

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
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  // Step 2
  const [cep, setCep] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");

  // Step 3
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [installments, setInstallments] = useState(1);
  const [beehivePublicKey, setBeehivePublicKey] = useState("");

  // PIX result
  const [pixData, setPixData] = useState<{ qrcode: string; url: string } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  // Transaction result
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  const priceInCents = orderData?.selectedKit === "completo" ? 26353 : 17393;
  const priceFormatted = orderData?.selectedKit === "completo" ? "263,53" : "173,93";
  const kitLabel = orderData?.selectedKit === "completo"
    ? "Kit Tapetes Internos Bandeja + Porta-Malas"
    : "Kit Tapetes Internos Bandeja";
  const colorLabel = orderData?.selectedColor || "Preto";

  const cleanPhone = (p: string) => p.replace(/\D/g, "");
  const cleanCpf = (c: string) => c.replace(/\D/g, "");
  const cleanCep = (c: string) => c.replace(/\D/g, "");

  // Format CPF as user types
  const formatCpf = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
  };

  // Format phone
  const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return `(${nums}`;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  // CEP auto-fill
  const handleCepChange = async (value: string) => {
    const formatted = value.replace(/\D/g, "").slice(0, 8);
    setCep(formatted.length > 5 ? `${formatted.slice(0, 5)}-${formatted.slice(5)}` : formatted);
    if (formatted.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${formatted}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddressStreet(data.logradouro || "");
          setNeighborhood(data.bairro || "");
          setCity(data.localidade || "");
          setUf(data.uf || "");
        }
      } catch {
        // ignore
      }
    }
  };

  const validateStep1 = () => {
    if (!name.trim() || name.trim().length < 3) {
      toast({ title: "Nome obrigatório", description: "Informe seu nome completo.", variant: "destructive" });
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "E-mail inválido", description: "Informe um e-mail válido.", variant: "destructive" });
      return false;
    }
    if (cleanPhone(phone).length < 10) {
      toast({ title: "Telefone inválido", description: "Informe um telefone válido.", variant: "destructive" });
      return false;
    }
    if (cleanCpf(cpf).length !== 11) {
      toast({ title: "CPF inválido", description: "Informe um CPF válido com 11 dígitos.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (cleanCep(cep).length !== 8) {
      toast({ title: "CEP inválido", variant: "destructive" });
      return false;
    }
    if (!addressStreet.trim() || !addressNumber.trim() || !neighborhood.trim() || !city.trim() || uf.length !== 2) {
      toast({ title: "Endereço incompleto", description: "Preencha todos os campos de endereço.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFinalizePurchase = async () => {
    setIsProcessing(true);

    try {
      let cardHash: string | undefined;

      if (paymentMethod === "card") {
        if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
          toast({ title: "Preencha todos os dados do cartão", variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        // Tokenize card via Beehive JS SDK
        if (!window.BeehivePay) {
          toast({ title: "Erro ao carregar gateway de pagamento", description: "Recarregue a página e tente novamente.", variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        window.BeehivePay.setPublicKey(beehivePublicKey);
        // Set to false for production
        window.BeehivePay.setTestMode(false);

        const [expMonth, expYear] = cardExpiry.split("/").map((v) => parseInt(v.trim(), 10));
        const fullYear = expYear < 100 ? 2000 + expYear : expYear;

        cardHash = await window.BeehivePay.encrypt({
          number: cardNumber.replace(/\s/g, ""),
          holderName: cardHolder,
          expMonth,
          expYear: fullYear,
          cvv: cardCvv,
        });
      }

      const itemTitle = `${kitLabel} – ${colorLabel}${orderData?.brand ? ` (${orderData.brand} ${orderData.model} ${orderData.year})` : ""}`;

      const payload: Record<string, unknown> = {
        amount: priceInCents,
        paymentMethod: paymentMethod === "card" ? "credit_card" : "pix",
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: cleanPhone(phone),
          document: {
            number: cleanCpf(cpf),
            type: "cpf",
          },
        },
        shipping: {
          fee: 0,
          address: {
            street: addressStreet.trim(),
            streetNumber: addressNumber.trim(),
            complement: complement.trim() || null,
            zipCode: cleanCep(cep),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: uf.toUpperCase(),
            country: "BR",
          },
        },
        items: [
          {
            title: itemTitle.slice(0, 200),
            unitPrice: priceInCents,
            quantity: 1,
            tangible: true,
          },
        ],
      };

      if (paymentMethod === "card" && cardHash) {
        payload.card = { hash: cardHash };
        payload.installments = installments;
      }

      if (paymentMethod === "pix") {
        payload.pix = { expiresInDays: 1 };
      }

      const { data, error } = await supabase.functions.invoke("create-transaction", {
        body: payload,
      });

      if (error) {
        toast({ title: "Erro no pagamento", description: "Tente novamente ou escolha outro método.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      if (data?.pix) {
        setPixData({ qrcode: data.pix.qrcode, url: data.pix.url });
        setTransactionStatus("waiting_payment");
      } else if (data?.status === "paid" || data?.status === "authorized") {
        setTransactionStatus("paid");
        toast({ title: "Pagamento aprovado! ✅", description: "Seu pedido foi confirmado." });
      } else if (data?.status === "refused") {
        toast({ title: "Pagamento recusado", description: data?.refusedReason?.description || "Tente outro cartão.", variant: "destructive" });
      } else {
        setTransactionStatus(data?.status || "processing");
        toast({ title: "Pagamento em processamento", description: "Aguarde a confirmação." });
      }
    } catch (err: any) {
      toast({ title: "Erro inesperado", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qrcode) {
      navigator.clipboard.writeText(pixData.qrcode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  const testimonials = [
    { name: "Pedro Álvares", text: "Foi minha primeira compra na CarpetCar para revender e fiquei muito satisfeito. Produtos de ótima qualidade." },
    { name: "Marco da Silva", text: "Já é minha segunda compra na CarpetCar e recomendo muito. O carpete veio sob medida e encaixou perfeito." },
    { name: "Tulio Vasconcelos", text: "Excelente experiência com a CarpetCar. Produto igual ao anúncio e acabamento impecável." },
  ];

  // Success screen
  if (transactionStatus === "paid") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="bg-background rounded-2xl border border-border p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Pedido confirmado! 🎉</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Seu kit será fabricado sob medida e enviado em breve. Você receberá atualizações por e-mail.
          </p>
          <button onClick={() => navigate("/")} className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:brightness-110 transition-all">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

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

      {/* Banner */}
      <div className="w-full">
        <img
          src={checkoutBanner}
          alt="CarpetCar - Frete Grátis Hoje - Encaixe perfeito no seu carro - Compra Segura"
          className="w-full h-auto object-cover"
          loading="eager"
          fetchPriority="high"
        />
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
            {/* Step 1 */}
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
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex.: Maria de Almeida Cruz" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={100} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">E-mail</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={255} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">CPF</label>
                    <input type="text" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={14} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Celular / Whatsapp</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={15} />
                  </div>
                  <button
                    onClick={() => validateStep1() && setCurrentStep(2)}
                    className="w-full bg-success text-primary-foreground font-bold py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{name} • {email}</p>
                  <button onClick={() => setCurrentStep(1)} className="text-primary text-sm font-semibold">Editar</button>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className={`bg-background rounded-xl border border-border p-6 ${currentStep !== 2 && "opacity-60"}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
                <h2 className="font-display font-bold text-lg">Entrega</h2>
              </div>
              {currentStep === 2 ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Preencha seu endereço para entrega.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-sm font-semibold block mb-1">CEP</label>
                      <input value={cep} onChange={(e) => handleCepChange(e.target.value)} placeholder="00000-000" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={9} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Endereço</label>
                    <input value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} placeholder="Rua, Avenida..." className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={200} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1">Número</label>
                      <input value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={10} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Complemento</label>
                      <input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={100} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Bairro</label>
                    <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={100} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1">Cidade</label>
                      <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={100} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Estado</label>
                      <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} placeholder="SP" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={2} />
                    </div>
                  </div>
                  <button
                    onClick={() => validateStep2() && setCurrentStep(3)}
                    className="w-full bg-success text-primary-foreground font-bold py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : currentStep > 2 ? (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{addressStreet}, {addressNumber} - {city}/{uf}</p>
                  <button onClick={() => setCurrentStep(2)} className="text-primary text-sm font-semibold">Editar</button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Preencha suas informações pessoais para continuar</p>
              )}
            </div>

            {/* Step 3 */}
            <div className={`bg-background rounded-xl border border-border p-6 ${currentStep !== 3 && "opacity-60"}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</span>
                <h2 className="font-display font-bold text-lg">Pagamento</h2>
              </div>
              {currentStep === 3 ? (
                <div className="mt-4 space-y-4">
                  {/* PIX QR Code result */}
                  {pixData ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="font-bold text-sm mb-3">Escaneie o QR Code ou copie o código PIX</p>
                        <div className="bg-background p-4 rounded-lg inline-block mb-3">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.qrcode)}`} alt="QR Code PIX" className="w-48 h-48" />
                        </div>
                        <div className="flex gap-2 max-w-sm mx-auto">
                          <input value={pixData.qrcode} readOnly className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background truncate" />
                          <button onClick={copyPixCode} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:brightness-110 transition-all">
                            {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {pixCopied ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">Após o pagamento, a confirmação é automática.</p>
                      </div>
                    </div>
                  ) : (
                    <>
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
                            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={19} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-semibold block mb-1">Validade</label>
                              <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/AA" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={5} />
                            </div>
                            <div>
                              <label className="text-sm font-semibold block mb-1">CVV</label>
                              <input value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="123" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={4} />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-semibold block mb-1">Nome no cartão</label>
                            <input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="Como está no cartão" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={100} />
                          </div>
                          <div>
                            <label className="text-sm font-semibold block mb-1">Parcelas</label>
                            <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background">
                              {[...Array(12)].map((_, i) => {
                                const n = i + 1;
                                const parcela = (priceInCents / 100 / n).toFixed(2).replace(".", ",");
                                return (
                                  <option key={n} value={n}>
                                    {n}x de R$ {parcela} {n === 1 ? " sem juros" : " com juros"}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleFinalizePurchase}
                        disabled={isProcessing}
                        className="w-full bg-success text-primary-foreground font-bold py-4 rounded-lg text-base flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-60"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          "Finalizar compra"
                        )}
                      </button>
                    </>
                  )}
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
                <span>R$ {priceFormatted}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 border-b border-border pb-4">
                <span className="font-semibold text-success">Total</span>
                <span className="font-bold text-success text-lg">R$ {priceFormatted}</span>
              </div>
              <div className="flex gap-3 items-start">
                <img src={prod1} alt="Produto" className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{kitLabel} – {colorLabel}</p>
                  <p className="text-xs text-muted-foreground mt-1">Qtd.: 1 &nbsp; R$ {priceFormatted}</p>
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
              <p className="text-xs text-muted-foreground">PIX • Cartão de Crédito</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
