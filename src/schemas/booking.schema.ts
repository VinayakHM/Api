import { z } from 'zod';

export const bookingDatesSchema = z.object({
  checkin: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: 'Date must be in YYYY-MM-DD format',
  }),
  checkout: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: 'Date must be in YYYY-MM-DD format',
  }),
});

export const bookingSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  totalprice: z.number().nonnegative('Total price must be non-negative'),
  depositpaid: z.boolean(),
  bookingdates: bookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const bookingWithIdSchema = z.object({
  bookingid: z.number().int().positive('Booking ID must be positive'),
  booking: bookingSchema,
});

export const createBookingResponseSchema = z.object({
  bookingid: z.number().int().positive('Booking ID must be positive'),
  booking: bookingSchema,
});

export const bookingListSchema = z.array(
  z.object({
    bookingid: z.number().int().positive(),
  })
);

export type BookingDates = z.infer<typeof bookingDatesSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type BookingWithId = z.infer<typeof bookingWithIdSchema>;
export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
export type BookingList = z.infer<typeof bookingListSchema>;
