import { HomePage } from "@/components/home-page";
import { fetchVendureProducts } from "@/lib/vendure";

export default async function Home() {
  return <HomePage products={await fetchVendureProducts()} />;
}
