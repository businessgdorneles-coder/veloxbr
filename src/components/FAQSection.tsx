import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Os tapetes são sob medida para cada carro?", a: "Sim. Os tapetes são produzidos sob medida de acordo com a marca, modelo e ano do seu veículo." },
  { q: "E se eu não encontrar meu modelo na lista?", a: "Você pode finalizar a compra normalmente e informar os dados do veículo após a compra." },
  { q: "O conjunto inclui quais peças?", a: "O conjunto inclui tapetes dianteiros e traseiros, conforme o padrão do veículo." },
  { q: "Qual é o material dos tapetes?", a: "Os tapetes são produzidos em Polipropileno premium + TPE moldado em 3D + base antiderrapante, resistente, impermeável e fácil de limpar." },
  { q: "Os tapetes escorregam?", a: "Não. Eles possuem base antiderrapante para maior segurança durante o uso." },
  { q: "É fácil de instalar?", a: "Sim. A instalação é simples e não exige ferramentas ou adaptações." },
  { q: "Como faço a limpeza?", a: "Basta um pano úmido ou detergente neutro. Não acumula poeira nem sujeira." },
  { q: "O produto tem garantia?", a: "Sim. Oferecemos garantia contra defeitos de fabricação." },
  { q: "Qual o prazo de envio?", a: "O envio ocorre após a produção do tapete, com prazo médio informado no momento da compra." },
  { q: "A entrega é feita pelos Correios?", a: "Sim. A entrega é realizada pelos Correios, com rastreamento e segurança." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-10">
          Perguntas frequentes
        </h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border/50 rounded-xl px-5">
              <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
