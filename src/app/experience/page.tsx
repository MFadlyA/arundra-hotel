import ExperiencePageClient from "@/components/ExperiencePageClient";
import { getCachedExperienceSettings } from "@/lib/cms-cache";

export const revalidate = 60;

export default async function ExperiencePage() {
  const settings = await getCachedExperienceSettings();
  return <ExperiencePageClient initialSettings={settings} />;
}
