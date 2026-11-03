import OffersPageClient from "@/components/OffersPageClient";
import { getCachedOffersSettings } from "@/lib/cms-cache";

export const revalidate = 60;

export default async function OffersPage() {
  const settings = await getCachedOffersSettings();
  return <OffersPageClient initialSettings={settings} />;
}
