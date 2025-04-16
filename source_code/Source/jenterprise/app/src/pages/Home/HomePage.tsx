import HeroBanner from "~/src/components/HeroBanner";
import ProductCategories from "~/src/components/TravelCategories";
import Promotions from "~/src/components/Promotions";
import Combos from "~/src/components/Combos";
import Footer from "~/src/components/Footer";

export default function Home() {
  return (
    <div className="bg-sky-50">
      <HeroBanner />
      <ProductCategories />
      <Promotions />
      <Combos />
    </div>
  );
}
