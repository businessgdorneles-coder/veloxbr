import { lazy, Suspense } from "react";
import MarqueeBar from "@/components/MarqueeBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

const DescriptionSection = lazy(() => import("@/components/DescriptionSection"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));

const LazySection = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-[200px]" />}>{children}</Suspense>
);

const Index = () => {

  return (
    <div className="min-h-screen overflow-x-hidden">
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
