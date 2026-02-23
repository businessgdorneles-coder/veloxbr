const messages = [
  "Frete Grátis Para Todo O Brasil 📦",
  "Trocas E Devoluções Em Até 7 Dias 🛒",
  "Satisfação Garantida Ou Dinheiro De Volta ❤️",
  "Pagamento Seguro via PIX com 5% OFF 🔒",
  "Entrega em 5 a 10 Dias Úteis 🚚",
];

const MarqueeBar = () => {
  const content = messages.join(" • ");

  return (
    <div className="bg-primary overflow-hidden whitespace-nowrap py-2">
      <div className="animate-marquee inline-flex gap-0">
        <span className="text-primary-foreground text-xs font-semibold tracking-wide px-4">
          {content} • {content} • {content}
        </span>
      </div>
    </div>
  );
};

export default MarqueeBar;
