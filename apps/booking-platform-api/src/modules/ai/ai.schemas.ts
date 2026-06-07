import { z } from "zod";
import { SUPPORTED_ROOM_AMENITIES, SUPPORTED_ROOM_LOCATIONS } from "../../config/constants";

const amenitySchema = z.enum(SUPPORTED_ROOM_AMENITIES);

export const roomSearchIntentRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(500),
  timezone: z.string().trim().min(1).max(80).optional(),
});

export const roomSearchIntentSchema = z
  .object({
    location: z.enum(SUPPORTED_ROOM_LOCATIONS).optional(),
    capacity: z.number().int().positive().max(100).optional(),
    capacityMode: z.enum(["AT_LEAST", "EXACT"]).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    amenities: z.array(amenitySchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && new Date(data.startTime) >= new Date(data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startTime must be earlier than endTime",
        path: ["startTime"],
      });
    }
  });

export const roomSearchIntentProviderResponseSchema = z.object({
  intent: roomSearchIntentSchema,
});

export type RoomSearchIntentRequestSchema = z.infer<typeof roomSearchIntentRequestSchema>;