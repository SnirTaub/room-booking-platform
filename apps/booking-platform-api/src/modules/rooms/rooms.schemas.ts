import { z } from "zod";

export const searchRoomsSchema = z
  .object({
    location: z.string().trim().min(1).optional(),
    capacity: z.coerce.number().int().positive().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    amenities: z
      .string()
      .optional()
      .transform((value: string | undefined) => {
        if (!value) {
          return undefined;
        }

        return value
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);
      }),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startTime must be earlier than endTime",
        path: ["startTime"],
      });
    }
  });

export const roomIdParamsSchema = z.object({
  roomId: z.coerce.number().int().positive(),
});

export type SearchRoomsSchema = z.infer<typeof searchRoomsSchema>;
export type RoomIdParamsSchema = z.infer<typeof roomIdParamsSchema>;