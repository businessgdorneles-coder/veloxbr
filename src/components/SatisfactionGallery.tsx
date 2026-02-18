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
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-10">
          SATISFAÇÃO <span className="text-gradient-blue">GARANTIDA</span>
        </h2>
      </div>

      {/* Marquee gallery */}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee gap-4" style={{ width: "max-content" }}>
          {[...galleryImages, ...galleryImages].map((img, i) => (
            <div key={i} className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shrink-0">
              <img
                src={img}
                alt="Cliente com produto"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-center mt-8 text-sm font-semibold">
        +5 mil <span className="text-muted-foreground font-normal">clientes satisfeitos</span>
      </p>
    </section>
  );
};

export default SatisfactionGallery;
