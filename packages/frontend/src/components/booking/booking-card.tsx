import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking, TimeSlot } from "@/types";

interface BookingCardProps {
  booking: Booking;
  slot?: TimeSlot;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function BookingCard({
  booking,
  slot,
  showActions,
  onApprove,
  onDecline,
  onDelete,
}: BookingCardProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-pool-pending/20 text-amber-800 border-amber-300 dark:text-amber-200",
    approved: "bg-pool-approved/20 text-blue-800 border-blue-300 dark:text-blue-200",
    declined: "bg-pool-declined/20 text-red-800 border-red-300 dark:text-red-200",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-[var(--foreground)]">
                {booking.eventName}
              </h4>
              <Badge variant="outline" className={statusColors[booking.status]}>
                {booking.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              by {booking.guestName}
            </p>
            {slot && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {slot.date} &middot; {slot.startTime} - {slot.endTime}
              </p>
            )}
            {booking.description && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {booking.description}
              </p>
            )}
          </div>
        </div>

        {showActions && booking.status === "pending" && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => onApprove?.(booking.id)}
              className="bg-pool-approved text-white hover:bg-pool-approved/80"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline?.(booking.id)}
              className="border-pool-declined text-pool-declined hover:bg-pool-declined/10"
            >
              Decline
            </Button>
          </div>
        )}

        {showActions && booking.status !== "pending" && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(booking.id)}
              className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
            >
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
