import type { FormEvent } from "react";
import type { AmenityOption } from "../../hooks/useRoomSearch";

interface RoomsFiltersProps {
  aiPrompt: string;
  isAiLoading: boolean;
  aiMessage: string;
  location: string;
  capacity: string;
  checkIn: string;
  checkOut: string;
  selectedAmenities: string[];
  amenities: AmenityOption[];
  onAiPromptChange: (value: string) => void;
  onAiPromptSubmit: () => void;
  onLocationChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onToggleAmenity: (code: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  error: string;
  success: string;
}

export function RoomsFilters(props: RoomsFiltersProps) {
  const {
    location,
    capacity,
    checkIn,
    checkOut,
    selectedAmenities,
    amenities,
    aiPrompt,
    isAiLoading,
    aiMessage,
    onAiPromptChange,
    onAiPromptSubmit,
    onLocationChange,
    onCapacityChange,
    onCheckInChange,
    onCheckOutChange,
    onToggleAmenity,
    onSubmit,
    error,
    success,
  } = props;

  return (
    <div className="card">
      <form onSubmit={onSubmit} className="card-form">
        <div className="ai-search-box">
          <div className="form-field">
            <label className="form-label">AI search</label>
            <textarea
              className="input textarea"
              value={aiPrompt}
              onChange={(e) => onAiPromptChange(e.target.value)}
              placeholder="Tel Aviv for 3 guests with parking and wifi next weekend"
              rows={3}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onAiPromptSubmit}
            disabled={isAiLoading}
          >
            {isAiLoading ? "Searching..." : "Search with AI"}
          </button>

          {aiMessage && <p className="text-success">{aiMessage}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Destination (city)</label>
          <input
            className="input"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. Tel Aviv"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Guests</label>
          <input
            className="input"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => onCapacityChange(e.target.value)}
            placeholder="e.g. 4"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Check-in</label>
          <input
            className="input"
            type="datetime-local"
            value={checkIn}
            onChange={(e) => onCheckInChange(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Check-out</label>
          <input
            className="input"
            type="datetime-local"
            value={checkOut}
            onChange={(e) => onCheckOutChange(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Amenities</label>
          <div className="amenities-chips">
            {amenities.map((amenity) => {
              const active = selectedAmenities.includes(amenity.code);
              return (
                <button
                  key={amenity.code}
                  type="button"
                  className={"amenity-chip" + (active ? " amenity-chip--active" : "")}
                  onClick={() => onToggleAmenity(amenity.code)}
                >
                  {amenity.label}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Search rooms
        </button>

        {error && <p className="text-error">{error}</p>}
        {success && <p className="text-success">{success}</p>}
      </form>
    </div>
  );
}