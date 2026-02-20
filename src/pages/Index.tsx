import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import BenefitsSection from "@/components/BenefitsSection";
import ProductSection from "@/components/ProductSection";
import { trackViewContent } from "@/lib/tiktokEvents";

const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const EmotionalSection = lazy(() => import("@/components/EmotionalSection"));
const SpecsSection = lazy(() => import("@/components/SpecsSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const SatisfactionGallery = lazy(() => import("@/components/SatisfactionGallery"));
const InstagramSection = lazy(() => import("@/components/InstagramSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Footer = lazy(() => import("@/components/Footer"));
const SocialProofPopup = lazy(() => import("@/components/SocialProofPopup"));

const LazySection = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[200px]" />}>{children}</Suspense>
);

const Index = () => {
  useEffect(() => {
    trackViewContent();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* 1. Hero — impacto imediato */}
        <HeroSection />

        {/* 2. Confiança imediata */}
        <TrustBar />

        {/* 3. Benefícios + Comparativo (por que comprar) */}
        <BenefitsSection />

        {/* 4. Apelo emocional (valorização, sensação, proteção) */}
        <LazySection><EmotionalSection /></LazySection>

        {/* 5. Tecnologia e diferenciais técnicos */}
        <LazySection><FeaturesSection /></LazySection>

        {/* 6. Especificações premium */}
        <LazySection><SpecsSection /></LazySection>

        {/* 7. Produto — configure e compre */}
        <ProductSection />

        {/* 8. Prova social — avaliações */}
        <LazySection><ReviewsSection /></LazySection>

        {/* 9. Galeria de clientes satisfeitos */}
        <LazySection><SatisfactionGallery /></LazySection>

        {/* 10. Instagram */}
        <LazySection><InstagramSection /></LazySection>

        {/* 11. FAQ */}
        <LazySection><FAQSection /></LazySection>
      </main>
      <LazySection><Footer /></LazySection>
      <LazySection><SocialProofPopup /></LazySection>
    </div>
  );
};

export default Index;
