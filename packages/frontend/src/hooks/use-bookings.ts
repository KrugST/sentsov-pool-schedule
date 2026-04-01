import { useState, useEffect, useCallback } from "react";
import type { Booking } from "@/types";
import { getBookings } from "@/lib/api";

export function useBookings(month: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings(month);
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bookings, loading, refresh };
}
