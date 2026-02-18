import { useState } from "react";
import { Check, Truck } from "lucide-react";

const ProductSection = () => {
  const [selectedKit, setSelectedKit] = useState<"interno" | "completo">("completo");

  return (
    <section id="produto" className="py-16 md:py-24">
      <div className="container max-w-4xl">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-2">
          Monte seu kit <span className="text-gradient-blue">sob medida</span>
        </h2>
        <p className="text-muted-foreground text-center mb-10 text-sm">
          Produzido sob medida para o seu veículo • Envio rápido
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => setSelectedKit("interno")}
            className={`relative rounded-xl border-2 p-6 text-left transition-all ${
              selectedKit === "interno"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <span className="inline-block bg-success text-primary-foreground text-xs font-bold px-2 py-0.5 rounded mb-3">
              MELHOR PREÇO
            </span>
            <h3 className="font-display font-bold text-sm mb-1">
              KIT TAPETES INTERNO <span className="text-muted-foreground font-normal">SEM PORTA MALAS</span>
            </h3>
            <p className="text-xs text-muted-foreground line-through">R$ 397,93</p>
            <p className="font-display text-2xl font-bold text-primary">R$ 173,93</p>
            <p className="text-xs text-muted-foreground">Economize R$ 224,00</p>
            {selectedKit === "interno" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </button>

          <button
            onClick={() => setSelectedKit("completo")}
            className={`relative rounded-xl border-2 p-6 text-left transition-all ${
              selectedKit === "completo"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <span className="inline-block bg-warning text-primary-foreground text-xs font-bold px-2 py-0.5 rounded mb-3">
              MAIS VENDIDO
            </span>
            <h3 className="font-display font-bold text-sm mb-1">
              KIT TAPETES INTERNO <span className="text-primary font-bold">+ PORTA MALAS</span>
            </h3>
            <p className="text-xs text-muted-foreground line-through">R$ 485,67</p>
            <p className="font-display text-2xl font-bold text-primary">R$ 263,53</p>
            <p className="text-xs text-muted-foreground">Economize R$ 222,14</p>
            {selectedKit === "completo" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </button>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 text-center mb-8">
          <p className="text-muted-foreground text-sm line-through mb-1">
            de R$ {selectedKit === "interno" ? "397,93" : "485,67"}
          </p>
          <p className="font-display text-4xl md:text-5xl font-bold text-primary mb-1">
            R$ {selectedKit === "interno" ? "173,93" : "263,53"}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            ou 12x de R$ {selectedKit === "interno" ? "14,49" : "21,96"}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            💡 Apenas R$ {selectedKit === "interno" ? "0,51" : "0,73"} por dia — Proteção premium pelo preço de um café ☕
          </p>

          <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-6 text-left">
            <select className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background">
              <option>Selecione o tipo</option>
              <option>Carro</option>
              <option>Caminhão</option>
            </select>
            <select className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background">
              <option>Selecione a marca</option>
            </select>
            <select className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background">
              <option>Selecione o modelo</option>
            </select>
            <select className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background">
              <option>Selecione o ano</option>
            </select>
          </div>

          <button className="w-full max-w-lg bg-primary text-primary-foreground font-bold py-4 rounded-lg text-base md:text-lg shadow-blue hover:brightness-110 transition-all">
            CONFIRMAR MINHA ENCOMENDA
          </button>
          <p className="text-xs text-muted-foreground mt-2">leva menos de 60 segundos</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Truck className="w-4 h-4" />
          <strong>Frete Grátis</strong> • Entrega estimada entre 5 a 10 dias úteis
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
