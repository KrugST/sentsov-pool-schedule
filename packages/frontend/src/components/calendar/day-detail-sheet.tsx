import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/booking/booking-form";
import type { TimeSlot, Booking } from "@/types";

interface DayDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  slot?: TimeSlot;
  bookings: Booking[];
  onBookingCreated: () => void;
}

export function DayDetailSheet({
  open,
  onOpenChange,
  date,
  slot,
  bookings,
  onBookingCreated,
}: DayDetailSheetProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);

  if (!date || !slot) return null;

  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasApproved = bookings.some((b) => b.status === "approved");
  const hasPending = bookings.some((b) => b.status === "pending");
  const canBook = !hasApproved && !hasPending;

  return (
    <Sheet open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) setShowBookingForm(false);
    }}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{dateStr}</SheetTitle>
          <SheetDescription>
            Pool available: {slot.startTime} - {slot.endTime}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-4">
          {/* Existing bookings */}
          {bookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                Bookings
              </h3>
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-[var(--border)] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--foreground)]">
                      {booking.eventName}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    by {booking.guestName}
                  </p>
                  {booking.description && (
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {booking.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Book button or form */}
          {canBook && !showBookingForm && (
            <Button
              className="w-full"
              onClick={() => setShowBookingForm(true)}
            >
              Book this slot
            </Button>
          )}

          {canBook && showBookingForm && (
            <BookingForm
              slotId={slot.id}
              onSuccess={() => {
                setShowBookingForm(false);
                onBookingCreated();
              }}
              onCancel={() => setShowBookingForm(false)}
            />
          )}

          {hasApproved && (
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              This slot is already booked.
            </p>
          )}
          {hasPending && !hasApproved && (
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              A booking request is pending approval.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const variants: Record<string, string> = {
    pending: "bg-pool-pending/20 text-amber-800 dark:text-amber-200",
    approved: "bg-pool-approved/20 text-blue-800 dark:text-blue-200",
    declined: "bg-pool-declined/20 text-red-800 dark:text-red-200",
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {status}
    </Badge>
  );
}
