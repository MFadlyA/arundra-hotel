"use client";

import { useEffect } from "react";
import type { Room } from "@/data/rooms";

export default function RoomCacheSaver({ room }: { room: Room }) {
  useEffect(() => {
    if (typeof window !== "undefined" && room?.slug) {
      try {
        sessionStorage.setItem(`arundra_room_${room.slug}`, JSON.stringify(room));
      } catch (err) {
        console.warn("Could not cache room for booking transition:", err);
      }
    }
  }, [room]);

  return null;
}
