import Navbar from "../../components/layout/Navbar";
import HeroSection from "../../components/home/HeroSection";
import ActionCards from "../../components/home/ActionCards";
import FeaturesSection from "../../components/home/FeaturesSection";
import Footer from "../../components/home/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <HeroSection />
      <ActionCards />
      <FeaturesSection />
      <Footer />
    </div>
  );
}