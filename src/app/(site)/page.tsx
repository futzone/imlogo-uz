import Hero from "@/components/Hero";
import HowItWorks from "@/components/Benefits/HowItWorks";
import Features from "@/components/Benefits/Features";
import Audience from "@/components/Benefits/Audience";
import TypingSection from "@/components/Typing/TypingSection";
import Testimonials from "@/components/Testimonials";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import { benefits } from "@/data/benefits";

const HomePage: React.FC = () => {
  const [howItWorks, features, audience] = benefits;

  return (
    <>
      <Hero />
      <HowItWorks benefit={howItWorks} />
      <Features benefit={features} />
      <TypingSection />
      <Audience benefit={audience} />
      <Testimonials />
      <Stats />
      <CTA />
    </>
  );
};

export default HomePage;
