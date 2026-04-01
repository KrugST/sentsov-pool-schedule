import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  getTimeSlotsByMonth,
  addTimeSlot,
  deleteTimeSlot,
  getTimeSlots,
} from "../storage/json-store.js";
import { adminAuth } from "../middleware/auth.js";

const timeslotRoutes = new Hono();

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// GET /api/timeslots?month=2026-07
timeslotRoutes.get("/", async (c) => {
  const month = c.req.query("month");
  const slots = month ? await getTimeSlotsByMonth(month) : await getTimeSlots();
  return c.json({ data: slots });
});

// POST /api/timeslots (admin only)
timeslotRoutes.post("/", adminAuth, async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid timeslot data", details: parsed.error.flatten() }, 400);
  }

  // Check for duplicate date
  const existing = await getTimeSlots();
  if (existing.some((s) => s.date === parsed.data.date)) {
    return c.json({ error: "A timeslot already exists for this date" }, 409);
  }

  const slot = {
    id: nanoid(),
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  await addTimeSlot(slot);
  return c.json({ data: slot }, 201);
});

// DELETE /api/timeslots/:id (admin only)
timeslotRoutes.delete("/:id", adminAuth, async (c) => {
  const id = c.req.param("id")!;
  const deleted = await deleteTimeSlot(id);
  if (!deleted) {
    return c.json({ error: "Timeslot not found" }, 404);
  }
  return c.json({ success: true });
});

export default timeslotRoutes;
