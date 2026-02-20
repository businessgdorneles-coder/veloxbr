import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";

const faqs = [
  { q: "Os tapetes são sob medida para cada carro?", a: "Sim. Os tapetes são produzidos sob medida de acordo com a marca, modelo e ano do seu veículo." },
  { q: "E se eu não encontrar meu modelo na lista?", a: "Você pode finalizar a compra normalmente e informar os dados do veículo após a compra." },
  { q: "O conjunto inclui quais peças?", a: "O conjunto inclui tapetes dianteiros e traseiros, conforme o padrão do veículo." },
  { q: "Qual é o material dos tapetes?", a: "Os tapetes são produzidos em Polipropileno premium + TPE moldado em 3D + base antiderrapante, resistente, impermeável e fácil de limpar." },
  { q: "Os tapetes escorregam?", a: "Não. Eles possuem base antiderrapante para maior segurança durante o uso." },
  { q: "É fácil de instalar?", a: "Sim. A instalação é simples e não exige ferramentas ou adaptações. Colocou, encaixou, pronto." },
  { q: "Como faço a limpeza?", a: "Basta um pano úmido ou detergente neutro. Não acumula poeira nem sujeira." },
  { q: "O produto tem garantia?", a: "Sim. Oferecemos garantia contra defeitos de fabricação." },
  { q: "Qual o prazo de envio?", a: "O envio ocorre após a produção do tapete, com prazo médio entre 5 e 10 dias úteis." },
  { q: "A entrega é feita pelos Correios?", a: "Sim. A entrega é realizada pelos Correios, com código de rastreamento enviado por e-mail." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Dúvidas frequentes
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Tem alguma <span className="text-gradient-blue">dúvida?</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Respondemos as perguntas mais comuns dos nossos clientes.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border/50 rounded-xl px-5 shadow-card"
            >
              <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline hover:text-primary transition-colors">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-10 text-center p-6 bg-card border border-border/50 rounded-2xl shadow-card">
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="font-bold text-sm mb-1">Não encontrou o que procura?</p>
          <p className="text-muted-foreground text-sm mb-4">Nossa equipe está disponível seg–sex, das 8h às 18h.</p>
          <a
            href="tel:+5511974004406"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm hover:brightness-110 transition-all shadow-blue"
          >
            Falar com suporte
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
