import { BaseClient } from './base.client';
import type { Booking, BookingList, CreateBookingResponse } from '../schemas/booking.schema';

export class BookingClient extends BaseClient {
  constructor(request: any) {
    // Use the restful-booker API for bookings
    super(request, 'https://restful-booker.herokuapp.com');
  }

  /**
   * Retrieves a list of all booking IDs
   * @param params - Optional query parameters (firstname, lastname, checkin, checkout)
   * @returns Promise with array of booking IDs
   */
  list(params?: {
    firstname?: string;
    lastname?: string;
    checkin?: string;
    checkout?: string;
  }) {
    return this.get<BookingList>('/booking', { params });
  }

  /**
   * Retrieves a specific booking by ID
   * @param id - The booking ID
   * @param accept - Optional accept header format (application/json or application/xml)
   * @returns Promise with booking details
   */
  getById(id: number | string, accept?: 'application/json' | 'application/xml') {
    const headers = accept ? { Accept: accept } : {};
    return this.get<Booking>(`/booking/${id}`, { headers });
  }

  /**
   * Creates a new booking
   * @param payload - Booking details (firstname, lastname, totalprice, depositpaid, bookingdates, additionalneeds)
   * @param accept - Optional accept header format (application/json or application/xml)
   * @returns Promise with newly created booking ID and details
   */
  create(payload: Omit<Booking, 'id'>, accept?: 'application/json' | 'application/xml') {
    const headers = accept ? { Accept: accept } : {};
    return this.post<CreateBookingResponse>('/booking', { data: payload, headers });
  }

  /**
   * Updates an existing booking
   * @param id - The booking ID to update
   * @param payload - Updated booking details
   * @param token - Optional auth token (either as Cookie or Authorization header)
   * @param accept - Optional accept header format
   * @returns Promise with updated booking details
   */
  update(
    id: number | string,
    payload: Omit<Booking, 'id'>,
    token?: string,
    accept?: 'application/json' | 'application/xml'
  ) {
    const headers: Record<string, string> = {};
    if (accept) headers.Accept = accept;
    if (token) headers.Cookie = `token=${token}`;
    return this.put<Booking>(`/booking/${id}`, { data: payload, headers });
  }

  /**
   * Deletes a booking
   * @param id - The booking ID to delete
   * @param token - Optional auth token (either as Cookie or Authorization header)
   * @returns Promise with deletion confirmation
   */
  delete(id: number | string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers.Cookie = `token=${token}`;
    return this.send<{ OK: string }>('DELETE', `/booking/${id}`, { headers });
  }
}
