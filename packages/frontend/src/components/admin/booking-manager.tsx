import { useState, useMemo } from "react";
import { useBookings } from "@/hooks/use-bookings";
import { useTimeslots } from "@/hooks/use-timeslots";
import { updateBookingStatus, deleteBookingApi } from "@/lib/api";
import { BookingCard } from "@/components/booking/booking-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Booking } from "@/types";

export function BookingManager() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const { bookings, refresh: refreshBookings } = useBookings(currentMonth);
  const { timeslots } = useTimeslots(currentMonth);

  const slotMap = useMemo(
    () => new Map(timeslots.map((s) => [s.id, s])),
    [timeslots]
  );

  // Month navigation
  function prevMonth() {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  function nextMonth() {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  async function handleApprove(id: string) {
    try {
      await updateBookingStatus(id, "approved");
      toast.success("Booking approved");
      refreshBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleDecline(id: string) {
    try {
      await updateBookingStatus(id, "declined");
      toast.success("Booking declined");
      refreshBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBookingApi(id);
      toast.success("Booking deleted");
      refreshBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  function filterByStatus(status: Booking["status"]) {
    return bookings.filter((b) => b.status === status);
  }

  const monthLabel = new Date(
    Number(currentMonth.split("-")[0]),
    Number(currentMonth.split("-")[1]) - 1,
    1
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevMonth}
          className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          &larr;
        </button>
        <span className="text-sm font-medium text-[var(--foreground)]">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          &rarr;
        </button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({filterByStatus("pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({filterByStatus("approved").length})
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined ({filterByStatus("declined").length})
          </TabsTrigger>
        </TabsList>

        {(["pending", "approved", "declined"] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            {filterByStatus(status).length === 0 ? (
              <p className="text-center text-sm text-[var(--muted-foreground)]">
                No {status} bookings for this month.
              </p>
            ) : (
              <div className="space-y-3">
                {filterByStatus(status).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    slot={slotMap.get(booking.slotId)}
                    showActions
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
