import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing/Pricing";
import FAQ from "@/components/FAQ";
import Logos from "@/components/Logos";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      {/* <Logos /> */}
      <Container className="mt-40">
        <Benefits />

        {/* <Section
          id="pricing"
          title="Pricing"
          description="Simple, transparent pricing. No surprises."
        >
          <Pricing />
        </Section> */}

        <Section
          id="testimonials"
          title="Foydalanuvchilarning fikrlari"
          description="«Imlo Go» foydalanuvchilarining fikrlari bilan tanishib chiqing."
        >
          <Testimonials />
        </Section>

        {/* <FAQ /> */}

        <Stats />
        
        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
