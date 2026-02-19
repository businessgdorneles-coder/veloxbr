import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Star, BadgeCheck, Play, Volume2, VolumeX } from "lucide-react";

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
    review: "Tapete de excelente qualidade, encaixou perfeitamente no carro.",
    video: "https://oficialcarpetcar.com/img/vd1.mp4",
    verified: "Cliente verificado",
  },
  {
    name: "Mariana Costa",
    photo: mulher1,
    review: "Deu outra cara pro interior do carro, material muito bonito.",
    video: "https://oficialcarpetcar.com/img/SaveSora_video_1767843500520.mp4",
    verified: "Cliente verificada",
  },
  {
    name: "Rafael Nogueira",
    photo: homem2,
    review: "Produto muito bem acabado e chegou rápido.",
    video: "https://oficialcarpetcar.com/img/vd2.mp4",
    verified: "Cliente verificado",
  },
  {
    name: "Ana Paula Ribeiro",
    photo: mulher1_2,
    review: "Ficou lindo no carro, super recomendo.",
    video: "https://oficialcarpetcar.com/img/vd3.mp4",
    verified: "Cliente verificada",
  },
  {
    name: "Bruno Martins",
    photo: homem3,
    review: "Encaixe perfeito e acabamento premium.",
    video: "https://oficialcarpetcar.com/img/vd4.mp4",
    verified: "Cliente verificado",
  },
  {
    name: "Camila Ferreira",
    photo: mulher3,
    review: "Material fácil de limpar e muito bonito.",
    video: "https://oficialcarpetcar.com/img/SaveSora_video_1767842395044.mp4",
    verified: "Cliente verificada",
  },
];

const ReviewVideoCard = ({ r }: { r: (typeof reviews)[0] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);

  // Lazy load video only when card is near viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause video when scrolled out of view
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
    if (playing) {
      v.pause();
    } else {
      v.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div ref={cardRef} className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Video */}
      <div className="relative aspect-[9/14] bg-muted">
        {inView && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            preload="auto"
            muted={muted}
            loop
          >
            <source src={r.video} type="video/mp4" />
          </video>
        )}

        {/* Play overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
          aria-label={playing ? "Pausar" : "Reproduzir"}
        >
          {!playing && (
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
            </div>
          )}
        </button>

        {/* Sound toggle */}
        {playing && (
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            aria-label={muted ? "Ativar áudio" : "Desativar áudio"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={r.photo}
            alt={r.name}
            className="w-10 h-10 rounded-full object-cover"
            loading="lazy"
            width={40}
            height={40}
          />
          <div>
            <p className="text-sm font-semibold">{r.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {r.verified} <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
          ))}
          <span className="ml-1 text-xs font-bold">5.0</span>
        </div>
        <p className="text-sm">{r.review}</p>
      </div>
    </div>
  );
};

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {reviews.map((r) => (
            <ReviewVideoCard key={r.name} r={r} />
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
