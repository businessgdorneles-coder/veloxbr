import { lazy, Suspense, useEffect } from "react";
import MarqueeBar from "@/components/MarqueeBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import { trackViewContent } from "@/lib/tiktokEvents";
import { metaTrackViewContent } from "@/lib/metaEvents";

const BenefitsSection = lazy(() => import("@/components/BenefitsSection"));
const EmotionalSection = lazy(() => import("@/components/EmotionalSection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const SpecsSection = lazy(() => import("@/components/SpecsSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Footer = lazy(() => import("@/components/Footer"));
const SocialProofPopup = lazy(() => import("@/components/SocialProofPopup"));

const LazySection = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[200px]" />}>{children}</Suspense>
);

const Index = () => {
  useEffect(() => {
    trackViewContent();
    metaTrackViewContent();
  }, []);

  return (
    <div className="min-h-screen">
      <MarqueeBar />
      <Header />
      <main>
        {/* 1. Hero = Product page (galeria + configurador) */}
        <HeroSection />

        {/* 2. Trust icons bar */}
        <TrustBar />

        {/* 3. Benefícios + Comparativo */}
        <LazySection><BenefitsSection /></LazySection>

        {/* 4. Apelo emocional */}
        <LazySection><EmotionalSection /></LazySection>

        {/* 5. Diferenciais técnicos */}
        <LazySection><FeaturesSection /></LazySection>

        {/* 6. Stats + Features */}
        <LazySection><StatsSection /></LazySection>

        {/* 7. Especificações */}
        <LazySection><SpecsSection /></LazySection>

        {/* 8. Avaliações */}
        <LazySection><ReviewsSection /></LazySection>

        {/* 9. FAQ */}
        <LazySection><FAQSection /></LazySection>
      </main>
      <LazySection><Footer /></LazySection>
      <LazySection><SocialProofPopup /></LazySection>
    </div>
  );
};

export default Index;
