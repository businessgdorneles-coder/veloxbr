import { Star } from "lucide-react";

import homem1 from "@/assets/homem1.jpg";
import mulher1 from "@/assets/mulher1.jpg";
import homem2 from "@/assets/homem2.jpg";
import mulher1_2 from "@/assets/mulher1-2.webp";
import homem3 from "@/assets/homem3.jpg";
import mulher3 from "@/assets/mulher3.png";

const reviews = [
  { name: "Lucas Almeida", photo: homem1, review: "Tapete de excelente qualidade, encaixou perfeitamente no carro." },
  { name: "Mariana Costa", photo: mulher1, review: "Deu outra cara pro interior do carro, material muito bonito." },
  { name: "Rafael Nogueira", photo: homem2, review: "Produto muito bem acabado e chegou rápido." },
  { name: "Ana Paula Ribeiro", photo: mulher1_2, review: "Ficou lindo no carro, super recomendo." },
  { name: "Bruno Martins", photo: homem3, review: "Encaixe perfeito e acabamento premium." },
  { name: "Camila Ferreira", photo: mulher3, review: "Material fácil de limpar e muito bonito." },
];

const ReviewsSection = () => {
  return (
    <section id="avaliacoes" className="py-16 md:py-24 bg-section-alt">
      <div className="container">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-2">
          Avaliações de clientes
        </h2>
        <p className="text-muted-foreground text-center mb-4 text-sm">
          Vídeos reais • Clientes verificados
        </p>
        <div className="flex items-center justify-center gap-1 mb-10">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-warning text-warning" />
          ))}
          <span className="ml-2 font-bold">4,9</span>
          <span className="text-muted-foreground text-sm ml-1">de 5 • 1.284 avaliações</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {reviews.map((r) => (
            <div key={r.name} className="bg-card rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                ))}
                <span className="ml-1 text-xs font-bold">5.0</span>
              </div>
              <p className="text-sm mb-4">{r.review}</p>
              <div className="flex items-center gap-3">
                <img src={r.photo} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Cliente verificado</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm text-muted-foreground">
          Mais de 5.000 clientes satisfeitos em todo o Brasil 🇧🇷
        </p>
      </div>
    </section>
  );
};

export default ReviewsSection;
