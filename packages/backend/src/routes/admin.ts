import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getAdminData, saveAdminData } from "../storage/json-store.js";
import { addSession } from "../middleware/auth.js";

const adminRoutes = new Hono();

const loginSchema = z.object({
  pin: z.string().min(4).max(10),
});

// POST /api/admin/login
adminRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "PIN must be 4-10 characters" }, 400);
  }

  let adminData = await getAdminData();

  // First-time setup: hash and store the PIN from env or first request
  if (!adminData) {
    const envPin = process.env.ADMIN_PIN;
    if (!envPin) {
      return c.json(
        { error: "No admin PIN configured. Set ADMIN_PIN environment variable." },
        500
      );
    }
    const hash = await bcrypt.hash(envPin, 10);
    adminData = { pinHash: hash };
    await saveAdminData(adminData);
  }

  const valid = await bcrypt.compare(parsed.data.pin, adminData.pinHash);
  if (!valid) {
    return c.json({ error: "Invalid PIN" }, 401);
  }

  const token = nanoid(32);
  addSession(token);

  return c.json({ token });
});

export default adminRoutes;
