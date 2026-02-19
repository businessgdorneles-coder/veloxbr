import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

// Lazy load below-fold sections
const BenefitsSection = lazy(() => import("@/components/BenefitsSection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const TrustBar = lazy(() => import("@/components/TrustBar"));
const SpecsSection = lazy(() => import("@/components/SpecsSection"));
const ProductSection = lazy(() => import("@/components/ProductSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const SatisfactionGallery = lazy(() => import("@/components/SatisfactionGallery"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Footer = lazy(() => import("@/components/Footer"));
const SocialProofPopup = lazy(() => import("@/components/SocialProofPopup"));

const LazySection = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[200px]" />}>{children}</Suspense>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <LazySection><BenefitsSection /></LazySection>
        <LazySection><FeaturesSection /></LazySection>
        <LazySection><TrustBar /></LazySection>
        <LazySection><SpecsSection /></LazySection>
        <LazySection><ProductSection /></LazySection>
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
