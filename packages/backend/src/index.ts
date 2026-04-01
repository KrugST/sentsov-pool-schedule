import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import adminRoutes from "./routes/admin.js";
import timeslotRoutes from "./routes/timeslots.js";
import bookingRoutes from "./routes/bookings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = new Hono();

// CORS for dev (Vite runs on different port)
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// API routes
app.route("/api/admin", adminRoutes);
app.route("/api/timeslots", timeslotRoutes);
app.route("/api/bookings", bookingRoutes);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

// In production, serve the frontend static files
import fs from "node:fs";
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(
    "/*",
    serveStatic({
      root: frontendDist,
      rewriteRequestPath: (p) => p,
    })
  );
  // SPA fallback: serve index.html for all non-API routes
  app.get("*", serveStatic({ root: frontendDist, path: "/index.html" }));
}

const port = Number(process.env.PORT) || 3001;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
