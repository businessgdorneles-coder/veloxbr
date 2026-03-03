import { Instagram, Heart, MessageCircle, ExternalLink } from "lucide-react";
import gallery1 from "@/assets/gallery-1.webp";
import gallery2 from "@/assets/gallery-2.webp";
import gallery3 from "@/assets/gallery-3.webp";
import gallery4 from "@/assets/gallery-4.webp";
import gallery5 from "@/assets/gallery-5.webp";
import gallery6 from "@/assets/gallery-6.webp";

const posts = [
  { img: gallery1, likes: "1.2k", comments: "38" },
  { img: gallery2, likes: "984", comments: "21" },
  { img: gallery3, likes: "2.1k", comments: "54" },
  { img: gallery4, likes: "763", comments: "17" },
  { img: gallery5, likes: "1.5k", comments: "42" },
  { img: gallery6, likes: "891", comments: "29" },
];

const InstagramSection = () => {
  return (
    <section className="py-16 md:py-24 bg-section-alt">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(340,82%,55%)] via-[hsl(20,90%,55%)] to-[hsl(40,92%,55%)] p-0.5 rounded-2xl mb-5">
            <div className="bg-background rounded-[14px] px-5 py-2.5 flex items-center gap-2">
              <Instagram className="w-5 h-5 text-[hsl(340,82%,55%)]" />
              <span className="font-display font-bold text-base">@carpetcar.oficial</span>
            </div>
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Nos siga no <span className="text-gradient-blue">Instagram</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Fotos reais de clientes, novidades e bastidores da produção. Venha fazer parte da comunidade!
          </p>
        </div>

        {/* Grid de posts */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8 max-w-3xl mx-auto">
          {posts.map((post, i) => (
            <a
              key={i}
              href="https://instagram.com/carpetcar.oficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/50 shadow-card"
            >
              <img
                src={post.img}
                alt={`Post Instagram CarpetCar ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
                width={240}
                height={240}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                <span className="flex items-center gap-1 text-white text-xs font-bold">
                  <Heart className="w-4 h-4 fill-white" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1 text-white text-xs font-bold">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  {post.comments}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="https://instagram.com/carpetcar.oficial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-bold px-8 py-4 rounded-xl text-sm text-white shadow-lg hover:brightness-110 transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(340,82%,55%) 0%, hsl(20,90%,55%) 50%, hsl(40,92%,55%) 100%)",
            }}
          >
            <Instagram className="w-5 h-5" />
            Seguir @carpetcar.oficial
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
          <p className="text-muted-foreground text-xs mt-3">
            Mais de <strong className="text-foreground">12k seguidores</strong> acompanham a gente
          </p>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
