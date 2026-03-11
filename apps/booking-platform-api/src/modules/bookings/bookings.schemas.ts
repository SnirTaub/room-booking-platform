import { z } from "zod"

export const createBookingSchema = z
  .object({
    roomId: z.number().int().positive(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime()
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime)
    const end = new Date(data.endTime)

    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startTime must be earlier than endTime"
      })
    }
  })

export type CreateBookingSchema = z.infer<typeof createBookingSchema>