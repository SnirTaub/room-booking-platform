import type { FormEvent } from "react";
import { useState } from "react";
import { searchRooms } from "../api/rooms.api";
import { createBooking } from "../api/bookings.api";
import { PageLayout } from "../components/layout/PageLayout";
import type { RoomSearchItemDto } from "../types/rooms.types";

export function SearchRoomsPage() {
  const [location, setLocation] = useState("TLV");
  const [capacity, setCapacity] = useState("1");
  const [startTime, setStartTime] = useState("2026-03-12T11:00:00Z");
  const [endTime, setEndTime] = useState("2026-03-12T12:00:00Z");
  const [amenities, setAmenities] = useState("");
  const [rooms, setRooms] = useState<RoomSearchItemDto[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const result = await searchRooms({
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        startTime,
        endTime,
        amenities: amenities || undefined,
        page: 1,
        limit: 20,
      });

      setRooms(result.items);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Search failed");
    }
  }

  async function handleBook(roomId: number) {
    setError("");
    setSuccess("");

    try {
      const result = await createBooking({
        roomId,
        startTime,
        endTime,
      });

      setSuccess(`Booking ${result.id} created successfully`);

      const refreshed = await searchRooms({
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        startTime,
        endTime,
        amenities: amenities || undefined,
        page: 1,
        limit: 20,
      });

      setRooms(refreshed.items);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Booking failed");
    }
  }

  return (
    <PageLayout title="Search Rooms">
      <form onSubmit={handleSearch} style={{ display: "grid", gap: "12px", marginBottom: 24 }}>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        <input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Capacity" />
        <input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Start time" />
        <input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="End time" />
        <input
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          placeholder="Amenities (comma separated)"
        />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ display: "grid", gap: "16px" }}>
        {rooms.map((room) => (
          <div
            key={room.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <h3>{room.name}</h3>
            <p>Location: {room.location}</p>
            <p>Capacity: {room.capacity}</p>
            <p>Amenities: {room.amenities.join(", ") || "None"}</p>
            <p>Available: {room.isAvailable ? "Yes" : "No"}</p>

            <button
              type="button"
              disabled={!room.isAvailable}
              onClick={() => handleBook(room.id)}
            >
              Book
            </button>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}