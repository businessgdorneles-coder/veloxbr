import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import ProductSection from "@/components/ProductSection";
import { trackViewContent } from "@/lib/tiktokEvents";

// Lazy load below-fold sections (not immediately visible)
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const TrustBar = lazy(() => import("@/components/TrustBar"));
const SpecsSection = lazy(() => import("@/components/SpecsSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const SatisfactionGallery = lazy(() => import("@/components/SatisfactionGallery"));
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
        <HeroSection />
        {/* BenefitsSection e ProductSection carregados imediatamente — above-the-fold em mobile */}
        <BenefitsSection />
        <LazySection><FeaturesSection /></LazySection>
        <LazySection><TrustBar /></LazySection>
        <LazySection><SpecsSection /></LazySection>
        <ProductSection />
        <LazySection><ReviewsSection /></LazySection>
        <LazySection><SatisfactionGallery /></LazySection>
        <LazySection><FAQSection /></LazySection>
      </main>
      <LazySection><Footer /></LazySection>
      <LazySection><SocialProofPopup /></LazySection>
    </div>
  );
};

export default Index;

