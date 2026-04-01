import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");

// Simple in-process mutex for file writes
const locks = new Map<string, Promise<void>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  let resolve: () => void;
  const next = new Promise<void>((r) => {
    resolve = r;
  });
  locks.set(key, next);
  await prev;
  try {
    return await fn();
  } finally {
    resolve!();
  }
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJSON<T>(filename: string, fallback: T): Promise<T> {
  const filepath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
}

// TimeSlots
export async function getTimeSlots(): Promise<
  import("../types/index.js").TimeSlot[]
> {
  return readJSON("timeslots.json", []);
}

export async function getTimeSlotsByMonth(
  month: string
): Promise<import("../types/index.js").TimeSlot[]> {
  const slots = await getTimeSlots();
  return slots.filter((s) => s.date.startsWith(month));
}

export async function getTimeSlotById(
  id: string
): Promise<import("../types/index.js").TimeSlot | undefined> {
  const slots = await getTimeSlots();
  return slots.find((s) => s.id === id);
}

export async function addTimeSlot(
  slot: import("../types/index.js").TimeSlot
): Promise<void> {
  return withLock("timeslots", async () => {
    const slots = await getTimeSlots();
    slots.push(slot);
    await writeJSON("timeslots.json", slots);
  });
}

export async function deleteTimeSlot(id: string): Promise<boolean> {
  return withLock("timeslots", async () => {
    const slots = await getTimeSlots();
    const idx = slots.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    slots.splice(idx, 1);
    await writeJSON("timeslots.json", slots);
    return true;
  });
}

// Bookings
export async function getBookings(): Promise<
  import("../types/index.js").Booking[]
> {
  return readJSON("bookings.json", []);
}

export async function getBookingsByMonth(
  month: string
): Promise<import("../types/index.js").Booking[]> {
  const bookings = await getBookings();
  const slots = await getTimeSlots();
  const slotDates = new Map(slots.map((s) => [s.id, s.date]));
  return bookings.filter((b) => {
    const date = slotDates.get(b.slotId);
    return date?.startsWith(month);
  });
}

export async function addBooking(
  booking: import("../types/index.js").Booking
): Promise<void> {
  return withLock("bookings", async () => {
    const bookings = await getBookings();
    bookings.push(booking);
    await writeJSON("bookings.json", bookings);
  });
}

export async function updateBooking(
  id: string,
  updates: Partial<import("../types/index.js").Booking>
): Promise<import("../types/index.js").Booking | null> {
  return withLock("bookings", async () => {
    const bookings = await getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    bookings[idx] = { ...bookings[idx], ...updates };
    await writeJSON("bookings.json", bookings);
    return bookings[idx];
  });
}

export async function deleteBooking(id: string): Promise<boolean> {
  return withLock("bookings", async () => {
    const bookings = await getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    bookings.splice(idx, 1);
    await writeJSON("bookings.json", bookings);
    return true;
  });
}

// Admin
export async function getAdminData(): Promise<import("../types/index.js").AdminData | null> {
  return readJSON("admin.json", null);
}

export async function saveAdminData(
  data: import("../types/index.js").AdminData
): Promise<void> {
  await ensureDataDir();
  await writeJSON("admin.json", data);
}
