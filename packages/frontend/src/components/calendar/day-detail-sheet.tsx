import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  const dateStr = date
    ? date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const hasApproved = bookings.some((b) => b.status === "approved");
  const hasPending = bookings.some((b) => b.status === "pending");
  const canBook = !hasApproved && !hasPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setShowBookingForm(false);
      }}
    >
      <DialogContent className="bg-white dark:bg-white dark:text-black">
        <DialogHeader>
          <DialogTitle>{dateStr}</DialogTitle>
          <DialogDescription>
            {slot
              ? `Pool available: ${slot.startTime} - ${slot.endTime}`
              : "No slot info"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          {canBook && !showBookingForm && slot && (
            <Button
              className="w-full"
              onClick={() => setShowBookingForm(true)}
            >
              Book this slot
            </Button>
          )}

          {canBook && showBookingForm && slot && (
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
      </DialogContent>
    </Dialog>
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
