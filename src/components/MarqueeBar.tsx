const messages = [
  { icon: "📦", text: "Frete Grátis Para Todo O Brasil" },
  { icon: "🔄", text: "Trocas E Devoluções Em Até 7 Dias" },
  { icon: "❤️", text: "Satisfação Garantida Ou Dinheiro De Volta" },
];

const MarqueeBar = () => {
  const items = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="bg-black overflow-hidden whitespace-nowrap">
      <div className="animate-marquee inline-flex items-center">
        {items.map((m, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-primary-foreground text-[11px] font-medium tracking-wide px-4 py-1.5">
            <span>{m.icon}</span>
            <span>{m.text}</span>
            <span className="text-primary-foreground/40 ml-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBar;
