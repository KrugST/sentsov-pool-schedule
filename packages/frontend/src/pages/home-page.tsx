import { useState } from "react";
import { PoolCalendar } from "@/components/calendar/pool-calendar";

export function HomePage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
        Pool Schedule
      </h1>
      <PoolCalendar month={currentMonth} onMonthChange={setCurrentMonth} />
    </div>
  );
}
