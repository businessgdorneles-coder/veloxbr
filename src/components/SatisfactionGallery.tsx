import gallery7 from "@/assets/gallery-7.jpg";
import foto1 from "@/assets/foto1.png";
import gallery6 from "@/assets/gallery-6.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery4 from "@/assets/gallery-4.png";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import foto5 from "@/assets/foto5.png";

const galleryImages = [gallery7, foto1, gallery6, gallery5, gallery4, gallery3, gallery2, gallery1, foto5];

const SatisfactionGallery = () => {
  return (
    <section className="py-16 md:py-24 bg-dark-section overflow-hidden">
      <div className="container mb-10">
        <div className="text-center">
          <span className="inline-block bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            Galeria de clientes
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
            Satisfação <span className="text-gradient-blue">garantida</span>
          </h2>
          <p className="text-white/50 text-sm">Fotos reais enviadas pelos nossos clientes</p>
        </div>
      </div>

      {/* Marquee gallery */}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee gap-4" style={{ width: "max-content" }}>
          {[...galleryImages, ...galleryImages].map((img, i) => (
            <div key={i} className="w-52 h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden shrink-0 border border-white/10">
              <img
                src={img}
                alt="Cliente com produto"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading={i < 3 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                width={256}
                height={256}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="container mt-10 text-center">
        <p className="text-white/60 text-sm">
          +5.000 clientes satisfeitos em todo o Brasil 🇧🇷
        </p>
      </div>
    </section>
  );
};

export default SatisfactionGallery;
