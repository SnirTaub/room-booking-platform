# Room Booking Platform

Small **room booking app** to show how I structure a full‑stack project.

- Backend: Node.js, Express, TypeScript, PostgreSQL, Redis  
- Frontend: React, TypeScript, Vite, React Router

You can:

- Sign up and log in
- Search for stays by city, dates, guests, and amenities
- See which listings are available for your dates
- Book a stay

---

## 1. How to run it locally

### 1.1. Backend (API)

From the repo root:

```bash
cd apps/booking-platform-api
npm install
```

Create `.env` in `apps/booking-platform-api`:

```env
PORT=3001

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=room_booking
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

JWT_SECRET=change-me
JWT_EXPIRES_IN=1d

CORS_ORIGIN=[http://localhost:5173]
```

#### Set up the database once

Make sure the `room_booking` database exists in Postgres, then run:

```bash
cd apps/booking-platform-api
psql -h localhost -d room_booking -U postgres -f schema.sql
```

This will:

- Create the tables (`users`, `rooms`, `room_amenities`, `bookings`)
- Insert a few example rooms + amenities so the UI isn’t empty

#### Start the API

```bash
cd apps/booking-platform-api
npm start
```

The API runs on `http://localhost:3001`.

Main routes:

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/rooms/search`
- `GET /v1/rooms/:roomId`
- `POST /v1/bookings`

---

### 1.2. Frontend (React app)

From the repo root:

```bash
cd apps/booking-platform-web
npm install
```

Create `.env` in `apps/booking-platform-web`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

Run the dev server:

```bash
cd apps/booking-platform-web
npm start
```

Vite usually runs on `http://localhost:5173`.

---

