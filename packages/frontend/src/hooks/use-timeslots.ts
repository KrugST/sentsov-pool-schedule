import { useState, useEffect, useCallback } from "react";
import type { TimeSlot } from "@/types";
import { getTimeslots } from "@/lib/api";

export function useTimeslots(month: string) {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTimeslots(month);
      setTimeslots(res.data);
    } catch {
      setTimeslots([]);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { timeslots, loading, refresh };
}
