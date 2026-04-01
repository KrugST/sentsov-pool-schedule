import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/lib/api";
import { toast } from "sonner";

interface BookingFormProps {
  slotId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({ slotId, onSuccess, onCancel }: BookingFormProps) {
  const [guestName, setGuestName] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !eventName.trim()) return;

    setSubmitting(true);
    try {
      await createBooking({
        slotId,
        guestName: guestName.trim(),
        eventName: eventName.trim(),
        description: description.trim(),
      });
      toast.success("Booking request submitted! Waiting for approval.");
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit booking"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-medium text-[var(--foreground)]">
        Book this slot
      </h3>

      <div className="space-y-2">
        <Label htmlFor="guestName">Your Name</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventName">Event Name</Label>
        <Input
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Pool Party"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any details about the event..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
