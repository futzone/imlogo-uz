import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Container className="mt-40">
        <Benefits />
        <Section
          id="testimonials"
          title="Foydalanuvchilarning fikrlari"
          description="«Imlo Go» foydalanuvchilarining fikrlari bilan tanishib chiqing."
        >
          <Testimonials />
        </Section>
        <Stats />
        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
