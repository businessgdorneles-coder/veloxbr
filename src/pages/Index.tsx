import { lazy, Suspense, useEffect } from "react";
import MarqueeBar from "@/components/MarqueeBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { trackViewContent } from "@/lib/tiktokEvents";
import { metaTrackViewContent } from "@/lib/metaEvents";

const DescriptionSection = lazy(() => import("@/components/DescriptionSection"));

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

        <LazySection><DescriptionSection /></LazySection>
      </main>
      
    </div>
  );
};

export default Index;
