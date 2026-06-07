import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { searchRooms } from "../api/rooms.api";
import { createBooking } from "../api/bookings.api";
import { parseRoomSearchIntent } from "../api/ai.api";
import { getFriendlyErrorMessage } from "../utils/errorMessages";
import type { RoomSearchItem, SearchRoomsResponse } from "../types/rooms.types";
import type { RoomSearchIntent, RoomSearchIntentResponse } from "../types/ai.types";

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

interface RoomSearchFilters {
  location: string;
  capacity: string;
  capacityMode: "AT_LEAST" | "EXACT";
  startTime: string;
  endTime: string;
  amenities: string[];
}

function toIsoUtc(datetimeLocal: string): string | null {
  const date = new Date(datetimeLocal);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function toDatetimeLocal(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function hasSearchDates(intent: RoomSearchIntent): intent is RoomSearchIntent & { startTime: string; endTime: string } {
  return Boolean(intent.startTime && intent.endTime);
}

export function useRoomSearch() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rooms, setRooms] = useState<RoomSearchItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

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

  const runRoomSearch = useCallback(
    async (targetPage: number, filters: RoomSearchFilters, options?: { skipDateValidation?: boolean }): Promise<SearchRoomsResponse | null> => {
      const startIso = options?.skipDateValidation ? filters.startTime : toIsoUtc(filters.startTime);
      const endIso = options?.skipDateValidation ? filters.endTime : toIsoUtc(filters.endTime);

      if (!startIso || !endIso) {
        setError("Please enter valid dates and times.");
        return null;
      }

      if (new Date(startIso) >= new Date(endIso)) {
        setError("Check-out must be after check-in.");
        return null;
      }

      const amenitiesParam = filters.amenities.length > 0 ? filters.amenities.join(",") : undefined;

      try {
        const result = await searchRooms({
          location: filters.location || undefined,
          capacity: filters.capacity ? Number(filters.capacity) : undefined,
          capacityMode: filters.capacityMode,
          startTime: startIso,
          endTime: endIso,
          amenities: amenitiesParam,
          page: targetPage,
          limit: PAGE_SIZE,
        });

        setRooms(result.items);
        setPage(result.page || targetPage);
        setTotal(result.total);
        setHasSearched(true);
        setError("");
        return result;
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, "search"));
        return null;
      }
    },
    []
  );

  const fetchRooms = useCallback(
    async (targetPage: number) => {
      const dates = buildDatesOrSetError();
      if (!dates) {
        return;
      }

      await runRoomSearch(targetPage, {
        location,
        capacity,
        capacityMode: "EXACT",
        startTime: checkIn,
        endTime: checkOut,
        amenities: selectedAmenities,
      });
    },
    [buildDatesOrSetError, capacity, checkIn, checkOut, location, runRoomSearch, selectedAmenities]
  );

  const handleAiPromptSubmit = useCallback(async () => {
    if (!aiPrompt.trim()) {
      setError("Please enter what you are looking for.");
      return;
    }

    setIsAiLoading(true);
    setError("");
    setSuccess("");
    setAiMessage("");

    try {
      const result: RoomSearchIntentResponse = await parseRoomSearchIntent({
        prompt: aiPrompt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (result.intent.location) {
        setLocation(result.intent.location);
      }
      if (result.intent.capacity) {
        setCapacity(String(result.intent.capacity));
      }
      if (result.intent.startTime) {
        setCheckIn(toDatetimeLocal(result.intent.startTime));
      }
      if (result.intent.endTime) {
        setCheckOut(toDatetimeLocal(result.intent.endTime));
      }
      if (result.intent.amenities) {
        setSelectedAmenities(result.intent.amenities);
      }

      if (!hasSearchDates(result.intent)) {
        setAiMessage("Search fields updated. Add dates to search.");
        return;
      }

      const nextFilters: RoomSearchFilters = {
        location: result.intent.location || "",
        capacity: result.intent.capacity ? String(result.intent.capacity) : "",
        capacityMode: result.intent.capacityMode || "EXACT",
        startTime: result.intent.startTime,
        endTime: result.intent.endTime,
        amenities: result.intent.amenities || [],
      };

      const searchResult = await runRoomSearch(1, nextFilters, { skipDateValidation: true });
      if (searchResult && searchResult.total > 0) {
        setAiMessage("Search fields updated and rooms loaded");
      } else if (searchResult) {
        setAiMessage("Search fields updated. No matching rooms found.");
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "ai"));
    } finally {
      setIsAiLoading(false);
    }
  }, [aiPrompt, runRoomSearch]);

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
        await createBooking({ roomId, startTime: startIso, endTime: endIso });

        setSuccess("Booking created successfully");

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
    ai: {
      prompt: aiPrompt,
      isLoading: isAiLoading,
      message: aiMessage,
    },
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
      hasSearched,
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
      setAiPrompt,
      handleAiPromptSubmit,
      toggleAmenity,
      handleSearchSubmit,
      handleBook,
      fetchRooms,
    },
  };
}