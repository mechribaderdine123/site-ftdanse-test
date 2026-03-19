import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import NewsSection from "@/components/NewsSection";
import CompetitionsSection from "@/components/CompetitionsSection";
import QuickAccess from "@/components/QuickAccess";
import DanceStylesSection from "@/components/DanceStylesSection";
import PartnersSection from "@/components/PartnersSection";
import VideosSection from "@/components/VideosSection";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <NewsSection />
      <CompetitionsSection />
      <QuickAccess />
      <DanceStylesSection />
      <PartnersSection />
      <VideosSection />
      <GallerySection />
      <Footer />
    </div>
  );
};

export default Index;
