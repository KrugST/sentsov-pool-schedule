import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeslots } from "@/hooks/use-timeslots";
import { createTimeslot, deleteTimeslot } from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function SlotManager() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const { timeslots, refresh } = useTimeslots(currentMonth);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("18:00");
  const [submitting, setSubmitting] = useState(false);

  const currentDate = useMemo(() => {
    const [year, m] = currentMonth.split("-").map(Number);
    return new Date(year, m - 1, 1);
  }, [currentMonth]);

  const slotDates = useMemo(
    () => timeslots.map((s) => new Date(s.date + "T00:00:00")),
    [timeslots]
  );

  function handleMonthChange(newMonth: Date) {
    const y = newMonth.getFullYear();
    const m = String(newMonth.getMonth() + 1).padStart(2, "0");
    setCurrentMonth(`${y}-${m}`);
  }

  async function handleAddSlot() {
    if (!selectedDate) return;

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    setSubmitting(true);
    try {
      await createTimeslot({
        date: dateStr,
        startTime,
        endTime,
      });
      toast.success(`Slot added for ${dateStr}`);
      setSelectedDate(undefined);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add slot");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTimeslot(id);
      toast.success("Slot removed");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Add slot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Open Slot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentDate}
            onMonthChange={handleMonthChange}
            modifiers={{ hasSlot: slotDates }}
            modifiersClassNames={{
              hasSlot: "bg-pool-open/20 text-green-900 dark:text-green-100",
            }}
            className="rounded-lg border border-[var(--border)]"
          />

          {selectedDate && (
            <div className="space-y-3 rounded-lg border border-[var(--border)] p-3">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startTime">Start</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime">End</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddSlot}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Adding..." : "Add Slot"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing slots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Open Slots ({timeslots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeslots.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              No slots for this month. Select a date to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {timeslots
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {new Date(slot.date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric" }
                        )}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(slot.id)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
