import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import AppShowcase from "../components/AppShowcase";
import LanguageSection from "../components/LanguageSection";
import AboutUs from "../components/AboutUs";
import BottomCTA from "../components/BottomCTA";
import "../styles/landing.css";

export default function Home() {
  return (
    <div className="landing-root">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <AppShowcase />
      <LanguageSection />
      <AboutUs />
      <BottomCTA />
    </div>
  );
}
