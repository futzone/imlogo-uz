import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CharacterCursor from "@/components/CharacterCursor";

/** Landing sahifalari (bosh sahifa, qo'llanma) uchun umumiy qolip. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>
        <CharacterCursor />
        {children}
      </main>
      <Footer />
    </>
  );
}
