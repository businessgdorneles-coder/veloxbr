import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TrustBar from "@/components/TrustBar";
import SpecsSection from "@/components/SpecsSection";
import ProductSection from "@/components/ProductSection";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <BenefitsSection />
        <FeaturesSection />
        <TrustBar />
        <SpecsSection />
        <ProductSection />
        <ReviewsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
