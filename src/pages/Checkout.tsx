import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ChevronRight, Star, ShieldCheck, Loader2, Copy, Check, BadgeCheck, Truck, RotateCcw, Headphones, Award, Clock, Smartphone, QrCode, CircleDollarSign, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import prod1 from "@/assets/prod1.webp";
import logoCheckout from "@/assets/logo-veloxbr-checkout.png";
import iconSsl from "@/assets/icon-ssl.png";
import seloRA from "@/assets/selo-ra.png";

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
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
    fbq?: (...args: unknown[]) => void;
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

  // Session ID for cart tracking
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem("cart_session_id");
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem("cart_session_id", id);
    return id;
  });

  const trackCart = (payload: Record<string, unknown>) => {
    supabase.functions.invoke("track-cart", {
      body: {
        session_id: sessionId,
        user_agent: navigator.userAgent,
        brand: orderData?.brand,
        model: orderData?.model,
        year: orderData?.year,
        vehicle_type: orderData?.vehicleType,
        selected_color: orderData?.selectedColor,
        selected_kit: orderData?.selectedKit,
        selected_texture: orderData?.selectedTexture,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term,
        src: utmParams.src,
        sck: utmParams.sck,
        ...payload,
      },
    }).catch(() => {});
  };

  // Smart scroll: only scrolls if element is not already visible on screen
  const scrollToIfNeeded = useCallback((elementId: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(elementId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      // Only scroll if the top of the element is above or below the visible area
      if (rect.top < 0 || rect.top > viewportHeight * 0.5) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  // Scroll to top and track cart start
  useEffect(() => {
    window.scrollTo(0, 0);
    trackCart({ payment_status: "cart_started", utmify_order_id: utmifyOrderId });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Steps
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const pixPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pixPollingRef.current) clearInterval(pixPollingRef.current);
    };
  }, []);

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
  const [shippingOption, setShippingOption] = useState<"free" | "dialog">("free");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [installments, setInstallments] = useState(1);
  const [beehivePublicKey, setBeehivePublicKey] = useState("");

  // PIX result
  const [pixData, setPixData] = useState<{ qrcode: string; url: string; transactionId?: string } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixCountdown, setPixCountdown] = useState(900);
  const pixSectionRef = useRef<HTMLDivElement>(null);

  // Transaction result
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  // PIX countdown timer
  const pixTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (pixData && transactionStatus !== "paid") {
      setPixCountdown(900);
      pixTimerRef.current = setInterval(() => {
        setPixCountdown((prev) => {
          if (prev <= 1) {
            if (pixTimerRef.current) clearInterval(pixTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (pixTimerRef.current) clearInterval(pixTimerRef.current);
    };
  }, [pixData, transactionStatus]);

  const formatCountdown = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  // Stable orderId and createdAt for UTMify (same across waiting_payment → paid)
  const [utmifyOrderId] = useState(() => `VELOX-${Date.now()}`);
  const [utmifyCreatedAt] = useState(() => new Date().toISOString().replace("T", " ").slice(0, 19));

  // UTM parameters - read from sessionStorage (persisted from landing page URL)
  const utmParams = (() => {
    // First try sessionStorage (saved by landing page)
    const stored = sessionStorage.getItem("utm_params");
    const fromStorage = stored ? JSON.parse(stored) : {};
    // Also check current URL as fallback (direct checkout link)
    const params = new URLSearchParams(window.location.search);
    return {
      src: fromStorage.src || params.get("src") || null,
      sck: fromStorage.sck || params.get("sck") || null,
      utm_source: fromStorage.utm_source || params.get("utm_source") || null,
      utm_campaign: fromStorage.utm_campaign || params.get("utm_campaign") || null,
      utm_medium: fromStorage.utm_medium || params.get("utm_medium") || null,
      utm_content: fromStorage.utm_content || params.get("utm_content") || null,
      utm_term: fromStorage.utm_term || params.get("utm_term") || null,
    };
  })();

  const shippingFeeCents = shippingOption === "dialog" ? 2390 : 0;
  const basePriceInCents = orderData?.selectedKit === "completo" ? 22990 : 13990;
  const PIX_DISCOUNT = 0.05;
  const productPriceInCents = paymentMethod === "pix"
    ? Math.round(basePriceInCents * (1 - PIX_DISCOUNT))
    : basePriceInCents;
  const priceInCents = productPriceInCents + shippingFeeCents;
  const priceFormatted = (priceInCents / 100).toFixed(2).replace(".", ",");
  const basePriceFormatted = (basePriceInCents / 100).toFixed(2).replace(".", ",");
  const discountInCents = basePriceInCents - Math.round(basePriceInCents * (1 - PIX_DISCOUNT));
  const discountFormatted = (discountInCents / 100).toFixed(2).replace(".", ",");
  const shippingFeeFormatted = (shippingFeeCents / 100).toFixed(2).replace(".", ",");
  const kitLabel = orderData?.selectedKit === "completo"
    ? "Kit Tapetes Internos Bandeja + Porta-Malas"
    : "Kit Tapetes Internos Bandeja";
  const colorLabel = orderData?.selectedColor || "Preto";

  const cleanPhone = (p: string) => p.replace(/\D/g, "");
  const cleanCpf = (c: string) => c.replace(/\D/g, "");
  const cleanCep = (c: string) => c.replace(/\D/g, "");

  const invokeWithKeepalive = (functionName: string, body: Record<string, unknown>) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`✅ ${functionName} OK`, data);
      } else {
        console.error(`❌ ${functionName} HTTP ${res.status}`, data);
      }
      return data;
    }).catch((err) => console.error(`❌ ${functionName} network error:`, err));
  };

  const sendUtmifyEvent = useCallback((status: string, approvedDate?: string) => {
    const payload = {
      orderId: utmifyOrderId,
      paymentMethod: paymentMethod === "card" ? "credit_card" : "pix",
      status,
      createdAt: utmifyCreatedAt,
      customer: {
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone(phone),
        document: cleanCpf(cpf),
      },
      product: {
        id: orderData?.selectedKit === "completo" ? "kit-completo" : "kit-interno",
        name: kitLabel,
      },
      priceInCents,
      approvedDate: approvedDate || null,
      trackingParameters: utmParams,
    };
    console.log("📤 UTMify event:", status, JSON.stringify(payload));
    return invokeWithKeepalive("utmify-sale", payload);
  }, [utmifyOrderId, utmifyCreatedAt, paymentMethod, name, email, phone, cpf, orderData, kitLabel, priceInCents, utmParams]);

  // Ref to always have the latest sendUtmifyEvent in polling callbacks
  const sendUtmifyEventRef = useRef(sendUtmifyEvent);
  useEffect(() => {
    sendUtmifyEventRef.current = sendUtmifyEvent;
  }, [sendUtmifyEvent]);

  const sendNotifySale = (notificationType: string) => {
    invokeWithKeepalive("notify-sale", {
      customerName: name.trim(),
      amount: priceInCents,
      paymentMethod: paymentMethod === "card" ? "credit_card" : "pix",
      product: kitLabel,
      city: city.trim(),
      notificationType,
    });
  };




  const formatCpf = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return `(${nums}`;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

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
    trackCart({
      payment_status: "payment_started",
      payment_method: paymentMethod === "card" ? "credit_card" : "pix",
      amount_cents: priceInCents,
    });
    try {
      let cardHash: string | undefined;

      if (paymentMethod === "card") {
        if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
          toast({ title: "Preencha todos os dados do cartão", variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        // Validate expiry format
        const expiryMatch = cardExpiry.replace(/\s/g, "").match(/^(\d{2})\/(\d{2,4})$/);
        if (!expiryMatch) {
          toast({ title: "Validade inválida", description: "Use o formato MM/AA (ex: 12/26).", variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        if (!window.BeehivePay) {
          toast({ title: "Erro ao carregar gateway de pagamento", description: "Recarregue a página e tente novamente.", variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        window.BeehivePay.setPublicKey(beehivePublicKey);
        window.BeehivePay.setTestMode(false);

        const expMonth = parseInt(expiryMatch[1], 10);
        const expYearRaw = parseInt(expiryMatch[2], 10);
        const fullYear = expYearRaw < 100 ? 2000 + expYearRaw : expYearRaw;

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
          fee: shippingFeeCents,
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
        const transactionId = data?.id || data?.transactionId;
        setPixData({ qrcode: data.pix.qrcode, url: data.pix.url, transactionId });
        setTransactionStatus("waiting_payment");
        trackCart({ payment_status: "pix_generated", transaction_id: transactionId, utmify_order_id: utmifyOrderId });
        // Auto-scroll to PIX section after state update
        setTimeout(() => scrollToIfNeeded("step-3"), 300);
        await sendUtmifyEvent("waiting_payment");
        sendNotifySale("pix_generated");

        if (transactionId) {
          pixPollingRef.current = setInterval(async () => {
            try {
              const { data: statusData } = await supabase.functions.invoke("create-transaction", {
                body: { checkStatus: true, transactionId },
              });
              console.log("🔄 PIX polling status:", statusData?.status, statusData);
              if (statusData?.status === "paid" || statusData?.status === "authorized") {
                if (pixPollingRef.current) {
                  clearInterval(pixPollingRef.current);
                  pixPollingRef.current = null;
                }
                // Fire all notifications BEFORE setTransactionStatus to avoid unmount cancellation
                try {
                  window.ttq?.track('CompletePayment', { content_type: 'product', value: priceInCents / 100, currency: 'BRL' });
                  window.fbq?.('track', 'Purchase', { value: priceInCents / 100, currency: 'BRL' });
                } catch {}
                trackCart({ payment_status: "paid" });
                console.log("🔥 Firing UTMify PAID event via ref...");
                await sendUtmifyEventRef.current("paid", new Date().toISOString().replace("T", " ").slice(0, 19));
                sendNotifySale("pix_paid");
                invokeWithKeepalive("meta-events", {
                  event_name: "Purchase",
                  value: priceInCents / 100,
                  currency: "BRL",
                  email: email.trim(),
                  phone: phone.trim(),
                  name: name.trim(),
                  city: city.trim(),
                  state: uf.toUpperCase(),
                  zip: cep.replace(/\D/g, ""),
                  client_user_agent: navigator.userAgent,
                  fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1],
                  fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1],
                });
                invokeWithKeepalive("tiktok-events", {
                  event: "CompletePayment",
                  value: priceInCents / 100,
                  currency: "BRL",
                  email: email.trim(),
                  phone: cleanPhone(phone),
                  name: name.trim(),
                  city: city.trim(),
                  state: uf.toUpperCase(),
                  zip: cep.replace(/\D/g, ""),
                  client_user_agent: navigator.userAgent,
                  ttp: document.cookie.match(/_ttp=([^;]+)/)?.[1],
                  ttclid: new URLSearchParams(window.location.search).get("ttclid") || undefined,
                  page_url: window.location.href,
                });
                toast({ title: "PIX confirmado! ✅", description: "Seu pagamento foi aprovado." });
                // Set state LAST to avoid premature re-render/unmount
                setTransactionStatus("paid");
              }
            } catch (pollErr) {
              console.error("❌ PIX polling error:", pollErr);
            }
          }, 5000);
        }
      } else if (data?.status === "paid" || data?.status === "authorized") {
        const cardTransactionId = data?.id || data?.transactionId;
        try {
          window.ttq?.track('CompletePayment', { content_type: 'product', value: priceInCents / 100, currency: 'BRL' });
          window.fbq?.('track', 'Purchase', { value: priceInCents / 100, currency: 'BRL' });
        } catch {}
        trackCart({ payment_status: "paid", transaction_id: cardTransactionId, utmify_order_id: utmifyOrderId });
        sendUtmifyEvent("paid", new Date().toISOString().replace("T", " ").slice(0, 19));
        sendNotifySale("card_paid");
        invokeWithKeepalive("meta-events", {
          event_name: "Purchase",
          value: priceInCents / 100,
          currency: "BRL",
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          city: city.trim(),
          state: uf.toUpperCase(),
          zip: cep.replace(/\D/g, ""),
          client_user_agent: navigator.userAgent,
          fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1],
          fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1],
        });
        invokeWithKeepalive("tiktok-events", {
          event: "CompletePayment",
          value: priceInCents / 100,
          currency: "BRL",
          email: email.trim(),
          phone: cleanPhone(phone),
          name: name.trim(),
          city: city.trim(),
          state: uf.toUpperCase(),
          zip: cep.replace(/\D/g, ""),
          client_user_agent: navigator.userAgent,
          ttp: document.cookie.match(/_ttp=([^;]+)/)?.[1],
          ttclid: new URLSearchParams(window.location.search).get("ttclid") || undefined,
          page_url: window.location.href,
        });
        toast({ title: "Pagamento aprovado! ✅", description: "Seu pedido foi confirmado." });
        setTransactionStatus("paid");
      } else if (data?.status === "refused") {
        toast({ title: "Pagamento recusado", description: data?.refusedReason?.description || "Tente outro cartão.", variant: "destructive" });
        trackCart({ payment_status: "refused" });
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
    { name: "Lucas Almeida", text: "Fiquei na dúvida antes de comprar, mas a Velox me surpreendeu! Tapete de altíssima qualidade. Recomendo!" },
    { name: "Mariana Costa", text: "Estava com um pé atrás, mas a Velox entregou tudo certinho e rápido. Produto incrível, loja confiável!" },
    { name: "Tulio Vasconcelos", text: "Pensei duas vezes antes de comprar online, mas valeu muito a pena. Encaixe perfeito e acabamento impecável." },
  ];

  // Success screen
  if (transactionStatus === "paid") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
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
    <div className="min-h-screen bg-muted/30 flex flex-col overflow-x-hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <header className="bg-primary py-3">
        <div className="container flex items-center justify-between max-w-6xl">
          <a href="/">
            <img src={logoCheckout} alt="VeloxBR" className="h-8 sm:h-10 object-contain" />
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-primary-foreground/60 text-[10px]">
              <BadgeCheck className="w-3.5 h-3.5 text-success" />
              <span>Loja Verificada</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary-foreground/60">
              <Lock className="w-3.5 h-3.5" />
              <div className="text-right">
                <p className="text-[10px] font-medium tracking-wider uppercase">Pagamento 100% Seguro</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="bg-primary border-b border-primary-foreground/10">
        <div className="container max-w-6xl py-2.5">
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
            {[
              { step: 1, label: "Identificação" },
              { step: 2, label: "Entrega" },
              { step: 3, label: "Pagamento" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    currentStep >= s.step
                      ? "bg-success text-primary-foreground"
                      : "bg-primary-foreground/15 text-primary-foreground/50"
                  }`}>
                    {currentStep > s.step ? <Check className="w-3 h-3" /> : s.step}
                  </span>
                  <span className={`hidden sm:inline font-medium transition-all ${
                    currentStep >= s.step ? "text-primary-foreground" : "text-primary-foreground/40"
                  }`}>{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-6 sm:w-10 h-0.5 rounded transition-all ${
                    currentStep > s.step ? "bg-success" : "bg-primary-foreground/15"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="px-3 sm:px-4 md:container max-w-6xl pb-8 pt-4 sm:pt-6 flex-1 mx-auto w-full">
        <div className="grid lg:grid-cols-[1fr_380px] gap-4 sm:gap-8">
          {/* Left - Form Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div id="step-1" className={`bg-background rounded-xl border border-border p-4 sm:p-6 ${currentStep !== 1 && "opacity-60"}`}>
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
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={255} autoComplete="email" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">CPF</label>
                    <input type="text" inputMode="numeric" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={14} autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Celular / Whatsapp</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={15} autoComplete="tel" />
                  </div>
                  <button
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                        setTimeout(() => scrollToIfNeeded("step-2"), 200);
                        trackCart({
                          payment_status: "identity_filled",
                          name: name.trim(),
                          email: email.trim(),
                          phone: cleanPhone(phone),
                          cpf: cleanCpf(cpf),
                        });
                      }
                    }}
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
            <div id="step-2" className={`bg-background rounded-xl border border-border p-4 sm:p-6 ${currentStep !== 2 && "opacity-60"}`}>
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
                      <input inputMode="numeric" value={cep} onChange={(e) => handleCepChange(e.target.value)} placeholder="00000-000" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={9} autoComplete="postal-code" />
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
                  {/* Shipping Options */}
                  <div className="pt-2">
                    <label className="text-sm font-semibold block mb-2">Opção de Frete</label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          shippingOption === "free"
                            ? "border-success bg-success/5"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingOption === "free"}
                          onChange={() => setShippingOption("free")}
                          className="accent-success w-4 h-4"
                        />
                        <Truck className="w-5 h-5 text-success shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-bold">Frete Grátis</p>
                          <p className="text-[11px] text-muted-foreground">Até 15 dias úteis</p>
                        </div>
                        <span className="text-sm font-bold text-success">Grátis</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          shippingOption === "dialog"
                            ? "border-success bg-success/5"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingOption === "dialog"}
                          onChange={() => setShippingOption("dialog")}
                          className="accent-success w-4 h-4"
                        />
                        <Truck className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-bold">Frete DiaLog</p>
                          <p className="text-[11px] text-muted-foreground">Transportadora • Entrega rápida</p>
                        </div>
                        <span className="text-sm font-bold">R$ 23,90</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (validateStep2()) {
                        setCurrentStep(3);
                        setTimeout(() => scrollToIfNeeded("step-3"), 200);
                        trackCart({
                          payment_status: "address_filled",
                          cep: cleanCep(cep),
                          city: city.trim(),
                          state: uf.toUpperCase(),
                          address: `${addressStreet.trim()}, ${addressNumber.trim()}${complement.trim() ? ` - ${complement.trim()}` : ''} - ${neighborhood.trim()}`,
                          amount_cents: priceInCents,
                          product_title: kitLabel,
                        });
                        window.ttq?.track('AddPaymentInfo', {
                          content_type: 'product',
                          value: priceInCents / 100,
                          currency: 'BRL',
                        });
                        window.fbq?.('track', 'AddPaymentInfo', { value: priceInCents / 100, currency: 'BRL' });
                      }
                    }}
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
            <div id="step-3" className={`bg-background rounded-xl border border-border p-4 sm:p-6 ${currentStep !== 3 && "opacity-60"}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</span>
                <h2 className="font-display font-bold text-lg">Pagamento</h2>
              </div>
              {currentStep === 3 ? (
                <div className="mt-4 space-y-4">
                  {/* PIX QR Code result */}
                  {pixData ? (
                    <div ref={pixSectionRef} className="space-y-4">
                      {/* Urgency countdown timer */}
                      <div className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-bold ${pixCountdown <= 120 ? "bg-destructive/10 text-destructive border border-destructive/30" : "bg-warning/10 text-warning border border-warning/30"}`}>
                        {pixCountdown <= 120 ? <AlertTriangle className="w-4 h-4 animate-pulse" /> : <Clock className="w-4 h-4" />}
                        {pixCountdown > 0
                          ? <>PIX expira em <span className="font-mono text-base">{formatCountdown(pixCountdown)}</span></>
                          : "PIX expirado — gere um novo"}
                      </div>

                      {/* Waiting payment status */}
                      {transactionStatus === "waiting_payment" && (
                        <div className="flex items-center justify-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-sm font-semibold text-primary">Aguardando pagamento...</span>
                        </div>
                      )}

                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="font-bold text-sm mb-3">Escaneie o QR Code ou copie o código PIX</p>
                        <div className="bg-background p-4 rounded-lg inline-block mb-3 ring-2 ring-primary/20">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.qrcode)}`} alt="QR Code PIX" className="w-48 h-48" />
                        </div>
                        <div className="flex gap-2 max-w-sm mx-auto">
                          <input value={pixData.qrcode} readOnly className="flex-1 border border-border rounded-lg px-3 py-2 text-xs bg-background truncate" />
                          <button onClick={copyPixCode} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:brightness-110 transition-all">
                            {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {pixCopied ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                      </div>

                      {/* Step-by-step PIX instructions */}
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Como pagar com PIX</p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</div>
                            <div>
                              <p className="text-sm font-semibold">Copie o código ou escaneie o QR Code</p>
                              <p className="text-xs text-muted-foreground">Toque em "Copiar" acima</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</div>
                            <div>
                              <p className="text-sm font-semibold">Abra o app do seu banco</p>
                              <p className="text-xs text-muted-foreground">Vá na opção PIX → Pagar com código</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</div>
                            <div>
                              <p className="text-sm font-semibold">Cole o código e confirme</p>
                              <p className="text-xs text-muted-foreground">A confirmação aqui é automática ✅</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Savings reminder */}
                      <div className="flex items-center justify-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                        <CircleDollarSign className="w-5 h-5 text-success" />
                        <p className="text-sm font-bold text-success">Você está economizando R$ {discountFormatted} com PIX!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setPaymentMethod("pix")}
                          className={`flex-1 border-2 rounded-lg py-3 text-sm font-bold transition-all relative ${paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          PIX
                          <span className="block text-[10px] font-semibold text-success leading-tight">5% de desconto</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod("card")}
                          className={`flex-1 border-2 rounded-lg py-3 text-sm font-bold transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          Cartão de Crédito
                        </button>
                      </div>

                      {paymentMethod === "pix" ? (
                        <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                          <div className="text-center mb-3">
                            <p className="text-base font-bold text-success mb-0.5">🎉 Você economiza R$ {discountFormatted} pagando no PIX!</p>
                            <p className="text-sm text-muted-foreground">Total com desconto: <strong className="text-foreground text-lg">R$ {priceFormatted}</strong></p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="flex flex-col items-center gap-1 p-2 bg-background/60 rounded-lg">
                              <QrCode className="w-4 h-4 text-success" />
                              <span className="text-[10px] font-semibold text-center leading-tight">QR Code instantâneo</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 bg-background/60 rounded-lg">
                              <Smartphone className="w-4 h-4 text-success" />
                              <span className="text-[10px] font-semibold text-center leading-tight">Pague pelo celular</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 bg-background/60 rounded-lg">
                              <Check className="w-4 h-4 text-success" />
                              <span className="text-[10px] font-semibold text-center leading-tight">Aprovação imediata</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground text-center">⚡ Ao confirmar, um QR Code PIX será gerado para pagamento.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-semibold block mb-1">Número do cartão</label>
                            <input inputMode="numeric" value={cardNumber} onChange={(e) => {
                              const nums = e.target.value.replace(/\D/g, "").slice(0, 16);
                              setCardNumber(nums.replace(/(.{4})/g, "$1 ").trim());
                            }} placeholder="0000 0000 0000 0000" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={19} autoComplete="cc-number" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-semibold block mb-1">Validade</label>
                            <input inputMode="numeric" value={cardExpiry} onChange={(e) => {
                              const nums = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (nums.length >= 3) {
                                setCardExpiry(`${nums.slice(0, 2)}/${nums.slice(2)}`);
                              } else {
                                setCardExpiry(nums);
                              }
                            }} placeholder="MM/AA" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={5} autoComplete="cc-exp" />
                            </div>
                            <div>
                              <label className="text-sm font-semibold block mb-1">CVV</label>
                              <input inputMode="numeric" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))} placeholder="123" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={4} autoComplete="cc-csc" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-semibold block mb-1">Nome no cartão</label>
                            <input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="Como está no cartão" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background" maxLength={100} />
                          </div>
                          <div>
                            <label className="text-sm font-semibold block mb-1">Parcelas</label>
                            <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background">
                              {[...Array(3)].map((_, i) => {
                                const n = i + 1;
                                const taxaMensal = 0.0299;
                                let totalComJuros = priceInCents / 100;
                                if (n > 1) {
                                  const fator = Math.pow(1 + taxaMensal, n);
                                  const pmt = (priceInCents / 100) * (taxaMensal * fator) / (fator - 1);
                                  totalComJuros = pmt * n;
                                }
                                const parcela = (totalComJuros / n).toFixed(2).replace(".", ",");
                                const totalFormatado = totalComJuros.toFixed(2).replace(".", ",");
                                return (
                                  <option key={n} value={n}>
                                    {n}x de R$ {parcela}{n === 1 ? " sem juros" : ` com juros (total R$ ${totalFormatado})`}
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
                          <>
                            <Lock className="w-4 h-4" />
                            Finalizar compra
                          </>
                        )}
                      </button>

                      {/* Trust indicators below button */}
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <img src={iconSsl} alt="SSL" className="h-5 object-contain opacity-60" />
                          <span className="text-[10px]">Ambiente seguro com criptografia SSL</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-muted-foreground/70">
                          <Truck className="w-3 h-3 shrink-0" />
                          <span className="text-[10px]">Código de rastreio enviado para seu e-mail imediatamente após a confirmação.</span>
                        </div>
                      </div>
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
            {/* Order Summary */}
            <div className="bg-background rounded-xl border border-border p-6">
              <h3 className="font-display font-bold text-lg mb-4 uppercase">Resumo do Pedido</h3>
              <div className="flex gap-3 items-start mb-4 pb-4 border-b border-border">
                <img src={prod1} alt="Produto" className="w-16 h-16 rounded-lg object-cover border border-border" />
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-tight">{kitLabel} – {colorLabel}</p>
                  {orderData?.brand && (
                    <p className="text-xs text-muted-foreground mt-1">{orderData.brand} {orderData.model} ({orderData.year})</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">Qtd.: 1</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className={paymentMethod === "pix" ? "line-through text-muted-foreground" : ""}>R$ {basePriceFormatted}</span>
                </div>
                {paymentMethod === "pix" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success font-medium">Desconto PIX (5%)</span>
                    <span className="text-success font-bold">– R$ {discountFormatted}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className={shippingOption === "free" ? "text-success font-medium" : ""}>Frete {shippingOption === "dialog" ? "DiaLog" : ""}</span>
                  <span className={shippingOption === "free" ? "text-success font-bold" : "font-bold"}>
                    {shippingOption === "free" ? "Grátis" : `R$ ${shippingFeeFormatted}`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-success text-xl">R$ {priceFormatted}</span>
              </div>
            </div>

            {/* Reclame Aqui + Trust Seals */}
            <div className="bg-background rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <img src={seloRA} alt="Selo Reclame Aqui" className="h-12 object-contain" />
                <div>
                  <p className="text-xs font-bold">Reclame Aqui</p>
                  <p className="text-[10px] text-muted-foreground">+5.000 clientes satisfeitos</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                  <ShieldCheck className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Compra Segura</p>
                    <p className="text-[9px] text-muted-foreground">Dados criptografados</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                  <Truck className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Entrega Segura</p>
                    <p className="text-[9px] text-muted-foreground">Todo o Brasil</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                  <RotateCcw className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Troca Garantida</p>
                    <p className="text-[9px] text-muted-foreground">Até 7 dias</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                  <BadgeCheck className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Loja Verificada</p>
                    <p className="text-[9px] text-muted-foreground">CNPJ ativo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-background rounded-xl border border-border p-5 space-y-3">
              <h4 className="font-display font-bold text-xs uppercase text-muted-foreground tracking-wider">Avaliações de clientes</h4>
              {testimonials.map((t, i) => (
                <div key={i} className={`${i > 0 ? "border-t border-border pt-3" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-[10px] font-bold">{t.name.charAt(0)}</span>
                    </div>
                    <p className="font-bold text-xs">{t.name}</p>
                    <div className="flex gap-0.5 ml-auto">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-2.5 h-2.5 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">"{t.text}"</p>
                </div>
              ))}
            </div>

            {/* SSL + Payment */}
            <div className="flex items-center justify-center gap-4 py-2">
              <img src={iconSsl} alt="SSL" className="h-6 object-contain opacity-50" />
              <div className="h-4 w-px bg-border" />
              <p className="text-[10px] text-muted-foreground">PIX • Cartão de Crédito</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-primary text-primary-foreground/70 mt-auto">
        <div className="container max-w-6xl py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoCheckout} alt="VeloxBR" className="h-6 object-contain opacity-80" />
              <div className="h-4 w-px bg-primary-foreground/15" />
              <p className="text-[10px]">Velox Centro Automotivo LTDA • CNPJ: 64.809.798/0001-08</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-success" />
                <span className="text-[10px]">Loja Verificada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span className="text-[10px]">Site Seguro SSL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                <span className="text-[10px]">(11) 97400-4406</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 pt-3 border-t border-primary-foreground/10">
            <p className="text-[9px] text-primary-foreground/40">© {new Date().getFullYear()} VeloxBR — Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
