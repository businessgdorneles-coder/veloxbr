import { lazy, Suspense, useEffect } from "react";
import MarqueeBar from "@/components/MarqueeBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { trackViewContent } from "@/lib/tiktokEvents";
import { metaTrackViewContent } from "@/lib/metaEvents";

const DescriptionSection = lazy(() => import("@/components/DescriptionSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
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
        {/* Product hero (galeria + configurador) */}
        <HeroSection />

        {/* Descrição do produto */}
        <LazySection><DescriptionSection /></LazySection>

        {/* Avaliações */}
        <LazySection><ReviewsSection /></LazySection>
      </main>
      <LazySection><Footer /></LazySection>
      <LazySection><SocialProofPopup /></LazySection>
    </div>
  );
};

export default Index;
