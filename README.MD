# Pool Schedule

A web app for managing pool availability and bookings. Friends and family can view the schedule and request bookings, while the admin approves or declines them.

## Setup

```bash
npm install
cp .env.example .env  # Set your ADMIN_PIN
```

## Development

```bash
npm run dev
```

Frontend runs on http://localhost:5173, backend on http://localhost:3001.

## Production

```bash
npm run build
ADMIN_PIN=your-pin npm start
```

The app runs on a single port (default 3001).

## Docker

```bash
docker build -t pool-schedule .
docker run -p 3001:3001 -e ADMIN_PIN=your-pin -v pool-data:/app/packages/backend/data pool-schedule
```

## Features

- **Public calendar** with color-coded days (green=open, yellow=pending, blue=booked)
- **Guest booking** — no login needed, just provide name and event details
- **Admin panel** — PIN-protected, manage open timeslots and approve/decline bookings
- **No database** — data stored as JSON files on disk
