import HomePageClient from "@/components/HomePageClient";
import { getCachedHomeData } from "@/lib/cms-cache";

export const revalidate = 60;

export default async function HomePage() {
  const homeData = await getCachedHomeData();

  return (
    <HomePageClient
      initialRooms={homeData.rooms}
      initialDifference={homeData.difference}
      initialEscape={homeData.escape}
      initialWhyBook={homeData.whyBook}
      initialHospitality={homeData.hospitality}
      initialSlides={homeData.slides}
      initialRoomsHeader={homeData.roomsHeader}
    />
  );
}
