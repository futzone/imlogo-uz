import Hero from "@/components/Hero";
import NewFeatures from "@/components/NewFeatures";
import HowItWorks from "@/components/Benefits/HowItWorks";
import AlphabetSection from "@/components/AlphabetSection";
import Features from "@/components/Benefits/Features";
import Audience from "@/components/Benefits/Audience";
import TypingSection from "@/components/Typing/TypingSection";
import Testimonials from "@/components/Testimonials";
import Stats from "@/components/Stats";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { benefits } from "@/data/benefits";
import { faqs } from "@/data/faq";

const HomePage: React.FC = () => {
  const [howItWorks, features, audience] = benefits;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <Hero />
      <NewFeatures />
      <HowItWorks benefit={howItWorks} />
      <AlphabetSection />
      <TypingSection />
      <Features benefit={features} />
      <Audience benefit={audience} />
      <Testimonials />
      <Stats />
      <FAQ />
      <CTA />
    </>
  );
};

export default HomePage;
