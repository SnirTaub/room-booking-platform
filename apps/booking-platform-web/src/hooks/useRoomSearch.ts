import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { searchRooms } from "../api/rooms.api";
import { createBooking } from "../api/bookings.api";
import { getFriendlyErrorMessage } from "../utils/errorMessages";
import type { RoomSearchItem } from "../types/rooms.types";

export interface AmenityOption {
  code: string;
  label: string;
}

const AMENITIES: AmenityOption[] = [
  { code: "WIFI", label: "Wifi" },
  { code: "AIR_CONDITIONING", label: "Air conditioning" },
  { code: "KITCHEN", label: "Kitchen" },
  { code: "WASHING_MACHINE", label: "Washing machine" },
  { code: "PARKING", label: "Parking" },
  { code: "POOL", label: "Pool" },
  { code: "PET_FRIENDLY", label: "Pet-friendly" },
];

const PAGE_SIZE = 10;

function toIsoUtc(datetimeLocal: string): string | null {
  const date = new Date(datetimeLocal);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export function useRoomSearch() {
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rooms, setRooms] = useState<RoomSearchItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const buildDatesOrSetError = useCallback((): { startIso: string; endIso: string } | null => {
    
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out.");
      return null;
    }
    const startIso = toIsoUtc(checkIn);
    const endIso = toIsoUtc(checkOut);
    if (!startIso || !endIso) {
      setError("Please enter valid dates and times.");
      return null;
    }
    if (new Date(startIso) >= new Date(endIso)) {
      setError("Check-out must be after check-in.");
      return null;
    }
    
    setError("");
    return { startIso, endIso };
  }, [checkIn, checkOut]);

  const fetchRooms = useCallback(
    async (targetPage: number) => {
      const dates = buildDatesOrSetError();
      if (!dates) {
        return;
      }
      const { startIso, endIso } = dates;

      const amenitiesParam =
        selectedAmenities.length > 0 ? selectedAmenities.join(",") : undefined;

      try {
        const result = await searchRooms({
          location: location || undefined,
          capacity: capacity ? Number(capacity) : undefined,
          startTime: startIso,
          endTime: endIso,
          amenities: amenitiesParam,
          page: targetPage,
          limit: PAGE_SIZE,
        });

        setRooms(result.items);
        setPage(result.page || targetPage);
        setTotal(result.total);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, "search"));
      }
    },
    [buildDatesOrSetError, capacity, location, selectedAmenities]
  );

  const handleSearchSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await fetchRooms(1);
    },
    [fetchRooms]
  );

  const handleBook = useCallback(
    async (roomId: number) => {
      setError("");
      setSuccess("");

      const dates = buildDatesOrSetError();
      if (!dates) {
        return;
      }
      const { startIso, endIso } = dates;

      try {
        const result = await createBooking({
          roomId,
          startTime: startIso,
          endTime: endIso,
        });

        setSuccess(`Booking ${result.id} created successfully`);

        await fetchRooms(page);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, "booking"));
      }
    },
    [buildDatesOrSetError, fetchRooms, page]
  );

  const toggleAmenity = useCallback((code: string) => {
    setSelectedAmenities((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
    );
  }, []);

  return {
    // state
    filters: {
      location,
      capacity,
      checkIn,
      checkOut,
      selectedAmenities,
    },
    results: {
      rooms,
      error,
      success,
      page,
      total,
      pageSize: PAGE_SIZE,
    },
    options: {
      amenities: AMENITIES,
    },
    // actions
    actions: {
      setLocation,
      setCapacity,
      setCheckIn,
      setCheckOut,
      toggleAmenity,
      handleSearchSubmit,
      handleBook,
      fetchRooms,
    },
  };
}