import { useState, useRef, useEffect } from "react";
import { Star, BadgeCheck, Play, Volume2, VolumeX, Quote } from "lucide-react";
import { proxyUrl } from "@/lib/mediaProxy";

import homem1 from "@/assets/homem1.jpg";
import mulher1 from "@/assets/mulher1.jpg";
import homem2 from "@/assets/homem2.jpg";
import mulher1_2 from "@/assets/mulher1-2.webp";
import homem3 from "@/assets/homem3.jpg";
import mulher3 from "@/assets/mulher3.png";

const reviews = [
  {
    name: "Lucas Almeida",
    photo: homem1,
    review: "Tapete de excelente qualidade, encaixou perfeitamente no carro. Ficou melhor do que esperava!",
    video: proxyUrl("https://oficialcarpetcar.com/img/vd1.mp4"),
    verified: "Cliente verificado",
    city: "São Paulo, SP",
  },
  {
    name: "Mariana Costa",
    photo: mulher1,
    review: "Deu outra cara pro interior do carro, material muito bonito. Recomendo a todos!",
    video: proxyUrl("https://oficialcarpetcar.com/img/SaveSora_video_1767843500520.mp4"),
    verified: "Cliente verificada",
    city: "Belo Horizonte, MG",
  },
  {
    name: "Rafael Nogueira",
    photo: homem2,
    review: "Produto muito bem acabado e chegou rápido. O encaixe é perfeito, sem folgas.",
    video: proxyUrl("https://oficialcarpetcar.com/img/vd2.mp4"),
    verified: "Cliente verificado",
    city: "Rio de Janeiro, RJ",
  },
  {
    name: "Ana Paula Ribeiro",
    photo: mulher1_2,
    review: "Ficou lindo no carro, super recomendo. Já indiquei para todos os meus amigos.",
    video: proxyUrl("https://oficialcarpetcar.com/img/vd3.mp4"),
    verified: "Cliente verificada",
    city: "Curitiba, PR",
  },
  {
    name: "Bruno Martins",
    photo: homem3,
    review: "Encaixe perfeito e acabamento premium. Vale muito o investimento.",
    video: proxyUrl("https://oficialcarpetcar.com/img/vd4.mp4"),
    verified: "Cliente verificado",
    city: "Porto Alegre, RS",
  },
  {
    name: "Camila Ferreira",
    photo: mulher3,
    review: "Material fácil de limpar e muito bonito. Meu carro ficou com cara de novo.",
    video: proxyUrl("https://oficialcarpetcar.com/img/SaveSora_video_1767842395044.mp4"),
    verified: "Cliente verificada",
    city: "Brasília, DF",
  },
];

const ReviewVideoCard = ({ r, priority = false }: { r: (typeof reviews)[0]; priority?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [playing]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); } else { v.play(); setPlaying(true); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div ref={cardRef} className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover-lift">
      <div className="relative aspect-[9/14] bg-muted/60 overflow-hidden">
        {/* Reviewer photo as styled placeholder until video plays */}
        {!playing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            {/* Blurred background from reviewer photo */}
            <img
              src={r.photo}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
              aria-hidden="true"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
            {/* Reviewer photo circle */}
            <img
              src={r.photo}
              alt={r.name}
              className="relative w-20 h-20 rounded-full object-cover border-3 border-white/80 shadow-xl mb-3 z-10"
            />
            <p className="relative text-white font-bold text-sm z-10">{r.name}</p>
            <p className="relative text-white/70 text-xs z-10">{r.city}</p>
            {/* Stars */}
            <div className="relative flex gap-0.5 mt-2 z-10">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
              ))}
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
          playsInline
          preload={priority ? "auto" : "metadata"}
          muted={muted}
          loop
          onCanPlay={() => setVideoReady(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={`${r.video}#t=0.001`} type="video/mp4" />
        </video>
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-20"
          aria-label={playing ? "Pausar" : "Reproduzir"}
        >
          {!playing && (
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg animate-pulse">
              <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
            </div>
          )}
        </button>
        {playing && (
          <button onClick={toggleMute} className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20" aria-label={muted ? "Ativar áudio" : "Desativar áudio"}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
          ))}
          <span className="ml-1 text-xs font-bold">5.0</span>
        </div>
        <div className="relative mb-3">
          <Quote className="w-4 h-4 text-primary/30 absolute -top-1 -left-0.5" />
          <p className="text-sm text-foreground/80 pl-4 leading-relaxed">{r.review}</p>
        </div>
        <div className="flex items-center gap-2.5 pt-3 border-t border-border/50">
          <img src={r.photo} alt={r.name} className="w-9 h-9 rounded-full object-cover border-2 border-primary/20" loading="lazy" width={36} height={36} />
          <div>
            <p className="text-xs font-bold">{r.name}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-primary" />{r.verified} · {r.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  return (
    <section id="avaliacoes" className="py-16 md:py-24 bg-section-alt">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block bg-warning/10 text-warning text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Prova social real
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Quem comprou,{" "}
            <span className="text-gradient-blue">aprovou</span>
          </h2>
          {/* Rating summary */}
          <div className="inline-flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-6 py-4 shadow-card">
            <div>
              <p className="font-display text-4xl font-bold text-foreground">4,9</p>
              <p className="text-xs text-muted-foreground">de 5.0</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">1.284 avaliações verificadas</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {reviews.map((r, i) => (
            <ReviewVideoCard key={r.name} r={r} priority={i < 2} />
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            🇧🇷 Mais de <strong className="text-foreground">5.000 clientes satisfeitos</strong> em todo o Brasil
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
