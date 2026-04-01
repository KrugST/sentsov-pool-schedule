export interface TimeSlot {
  id: string;
  date: string; // "2026-07-15"
  startTime: string; // "14:00"
  endTime: string; // "18:00"
  createdAt: string;
}

export interface Booking {
  id: string;
  slotId: string;
  guestName: string;
  eventName: string;
  description: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
