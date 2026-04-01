import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useTimeslots } from "@/hooks/use-timeslots";
import { useBookings } from "@/hooks/use-bookings";
import { DayDetailSheet } from "./day-detail-sheet";
import type { TimeSlot, Booking } from "@/types";

interface PoolCalendarProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function PoolCalendar({ month, onMonthChange }: PoolCalendarProps) {
  const { timeslots, refresh: refreshSlots } = useTimeslots(month);
  const { bookings, refresh: refreshBookings } = useBookings(month);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentDate = useMemo(() => {
    const [year, m] = month.split("-").map(Number);
    return new Date(year, m - 1, 1);
  }, [month]);

  // Build maps for quick lookup
  const slotsByDate = useMemo(() => {
    const map = new Map<string, TimeSlot>();
    for (const slot of timeslots) {
      map.set(slot.date, slot);
    }
    return map;
  }, [timeslots]);

  const bookingsBySlotId = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const existing = map.get(booking.slotId) ?? [];
      existing.push(booking);
      map.set(booking.slotId, existing);
    }
    return map;
  }, [bookings]);

  // Classify dates for coloring
  const openDates: Date[] = [];
  const pendingDates: Date[] = [];
  const approvedDates: Date[] = [];

  for (const [dateStr, slot] of slotsByDate) {
    const slotBookings = bookingsBySlotId.get(slot.id) ?? [];
    const hasApproved = slotBookings.some((b) => b.status === "approved");
    const hasPending = slotBookings.some((b) => b.status === "pending");

    const d = new Date(dateStr + "T00:00:00");
    if (hasApproved) {
      approvedDates.push(d);
    } else if (hasPending) {
      pendingDates.push(d);
    } else {
      openDates.push(d);
    }
  }

  const modifiers = {
    poolOpen: openDates,
    poolPending: pendingDates,
    poolApproved: approvedDates,
  };

  const modifiersClassNames = {
    poolOpen:
      "!bg-green-500/15 !text-black hover:!bg-green-500/25",
    poolPending:
      "!bg-amber-500/15 !text-black hover:!bg-amber-500/25",
    poolApproved:
      "!bg-blue-500/15 !text-black hover:!bg-blue-500/25",
  };

  function handleDayClick(day: Date) {
    const dateStr = formatDate(day);
    if (slotsByDate.has(dateStr)) {
      setSelectedDate(day);
    }
  }

  function handleMonthChange(newMonth: Date) {
    const y = newMonth.getFullYear();
    const m = String(newMonth.getMonth() + 1).padStart(2, "0");
    onMonthChange(`${y}-${m}`);
  }

  const selectedSlot = selectedDate
    ? slotsByDate.get(formatDate(selectedDate))
    : undefined;
  const selectedBookings = selectedSlot
    ? bookingsBySlotId.get(selectedSlot.id) ?? []
    : [];

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-pool-open" />
          <span className="text-[var(--muted-foreground)]">Open</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-pool-pending" />
          <span className="text-[var(--muted-foreground)]">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-pool-approved" />
          <span className="text-[var(--muted-foreground)]">Booked</span>
        </div>
      </div>

      <Calendar
        mode="single"
        month={currentDate}
        onMonthChange={handleMonthChange}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        onDayClick={handleDayClick}
        className="rounded-lg border border-[var(--border)] p-4 [--cell-size:--spacing(12)] sm:[--cell-size:--spacing(14)]"
      />

      <DayDetailSheet
        open={selectedDate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
        date={selectedDate}
        slot={selectedSlot}
        bookings={selectedBookings}
        onBookingCreated={() => {
          refreshBookings();
          refreshSlots();
        }}
      />
    </div>
  );
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
