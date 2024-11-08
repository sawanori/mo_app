import { HeroSection } from "@/components/hero-section";
import { MenuWrapper } from "@/components/menu-wrapper";
import Navigation from "@/components/navigation";
import { OrderConfirmation } from "@/components/order-confirmation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8 space-y-8 mb-32">
        <HeroSection />
        <MenuWrapper />
      </main>
      <OrderConfirmation />
    </>
  );
}