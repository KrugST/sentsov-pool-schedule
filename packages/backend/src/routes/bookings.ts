import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  getBookingsByMonth,
  getBookings,
  addBooking,
  updateBooking,
  deleteBooking,
} from "../storage/json-store.js";
import { getTimeSlotById } from "../storage/json-store.js";
import { adminAuth, isValidSession } from "../middleware/auth.js";

const bookingRoutes = new Hono();

const createSchema = z.object({
  slotId: z.string(),
  guestName: z.string().min(1).max(100),
  eventName: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
});

const updateSchema = z.object({
  status: z.enum(["approved", "declined"]),
});

// GET /api/bookings?month=2026-07
// Public: returns only approved bookings
// Admin (with token): returns all bookings
bookingRoutes.get("/", async (c) => {
  const month = c.req.query("month");
  const header = c.req.header("Authorization");
  const isAdmin =
    header?.startsWith("Bearer ") && isValidSession(header.slice(7));

  const bookings = month
    ? await getBookingsByMonth(month)
    : await getBookings();

  if (isAdmin) {
    return c.json({ data: bookings });
  }

  // Public only sees approved and pending bookings (pending shows as "requested")
  const publicBookings = bookings.filter(
    (b) => b.status === "approved" || b.status === "pending"
  );
  return c.json({ data: publicBookings });
});

// POST /api/bookings (public)
bookingRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid booking data", details: parsed.error.flatten() },
      400
    );
  }

  // Check slot exists
  const slot = await getTimeSlotById(parsed.data.slotId);
  if (!slot) {
    return c.json({ error: "Timeslot not found" }, 404);
  }

  // Check no approved booking exists for this slot
  const allBookings = await getBookings();
  const hasApproved = allBookings.some(
    (b) => b.slotId === parsed.data.slotId && b.status === "approved"
  );
  if (hasApproved) {
    return c.json({ error: "This timeslot is already booked" }, 409);
  }

  // Check no pending booking exists for this slot
  const hasPending = allBookings.some(
    (b) => b.slotId === parsed.data.slotId && b.status === "pending"
  );
  if (hasPending) {
    return c.json(
      { error: "A booking request is already pending for this timeslot" },
      409
    );
  }

  const now = new Date().toISOString();
  const booking = {
    id: nanoid(),
    ...parsed.data,
    status: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };

  await addBooking(booking);
  return c.json({ data: booking }, 201);
});

// PATCH /api/bookings/:id (admin only)
bookingRoutes.patch("/:id", adminAuth, async (c) => {
  const id = c.req.param("id")!;
  const body = await c.req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid status" }, 400);
  }

  const updated = await updateBooking(id, {
    status: parsed.data.status,
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return c.json({ error: "Booking not found" }, 404);
  }

  return c.json({ data: updated });
});

// DELETE /api/bookings/:id (admin only)
bookingRoutes.delete("/:id", adminAuth, async (c) => {
  const id = c.req.param("id")!;
  const deleted = await deleteBooking(id);
  if (!deleted) {
    return c.json({ error: "Booking not found" }, 404);
  }
  return c.json({ success: true });
});

export default bookingRoutes;
