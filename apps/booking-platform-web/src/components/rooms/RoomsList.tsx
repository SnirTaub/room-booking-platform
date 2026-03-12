import type { RoomSearchItemDto } from "../../types/rooms.types";

interface RoomsListProps {
  rooms: RoomSearchItemDto[];
  onBook: (roomId: number) => void;
}

export function RoomsList({ rooms, onBook }: RoomsListProps) {
  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <div key={room.id} className="room-card">
          <div>
            <h3 className="room-title">{room.name}</h3>
            <div className="room-meta">
              <span>{room.location}</span>
              {" • "}
              <span>Sleeps {room.capacity} guests</span>
            </div>
            <div className="room-meta">
              Amenities: {room.amenities.join(", ") || "None"}
            </div>
          </div>

          <div className="room-footer">
            <span className={`badge ${room.isAvailable ? "badge-green" : "badge-red"}`}>
              {room.isAvailable ? "Available" : "Unavailable"}
            </span>
            <button
              type="button"
              disabled={!room.isAvailable}
              onClick={() => onBook(room.id)}
              className="btn btn-outline"
              style={{ opacity: room.isAvailable ? 1 : 0.6 }}
            >
              Book
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}