import { lazy, Suspense, useEffect } from "react";
import MarqueeBar from "@/components/MarqueeBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

const DescriptionSection = lazy(() => import("@/components/DescriptionSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));

const LazySection = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[200px]" />}>{children}</Suspense>
);

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];

const Index = () => {
  // Persist UTM params from URL to sessionStorage so they survive navigation to /checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmData: Record<string, string> = {};
    let hasAny = false;
    UTM_KEYS.forEach((key) => {
      const val = params.get(key);
      if (val) { utmData[key] = val; hasAny = true; }
    });
    if (hasAny) {
      sessionStorage.setItem("utm_params", JSON.stringify(utmData));
    }
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden border border-border">
      <MarqueeBar />
      <Header />
      <main>
        <HeroSection />
        <LazySection><DescriptionSection /></LazySection>
        <LazySection><ReviewsSection /></LazySection>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
