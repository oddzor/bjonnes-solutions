import { Contact } from "@/components/contact";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { CallButton, Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Jobs } from "@/components/jobs";
import { Reviews } from "@/components/reviews";
import { Services } from "@/components/services";

// The page reads as a cut through the ground: sky, surface, soil and rock, top to bottom.
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Reviews />
        <Jobs />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <CallButton />
    </>
  );
}
