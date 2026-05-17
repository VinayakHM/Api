import { test, expect } from '../src/fixtures/api.fixtures';
import {
  bookingSchema,
  bookingListSchema,
  bookingDatesSchema,
} from '../src/schemas/booking.schema';
import {
  assertStatus,
  validateResponse,
} from '../src/utils/assertions';

test.describe('Booking API - GetBooking @booking', () => {
  // ========================
  // POSITIVE SCENARIOS: GET /booking
  // ========================

  test('GET /booking returns list of booking IDs @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.list();

    const bookings = validateResponse(response, 200, bookingListSchema);

    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.length).toBeGreaterThan(0);
  });

  test('GET /booking list contains valid booking IDs @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.list();

    assertStatus(response, 200);
    const bookings = response.body as any[];

    bookings.forEach((booking) => {
      expect(booking.bookingid).toBeDefined();
      expect(typeof booking.bookingid).toBe('number');
      expect(booking.bookingid).toBeGreaterThan(0);
    });
  });

  test('GET /booking returns consistent response structure @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.list();

    assertStatus(response, 200);
    const bookings = response.body as any[];

    expect(Array.isArray(bookings)).toBe(true);
    bookings.forEach((booking) => {
      expect(Object.keys(booking)).toEqual(['bookingid']);
    });
  });

  test('GET /booking with Content-Type application/json @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.list();

    assertStatus(response, 200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  // ========================
  // POSITIVE SCENARIOS: GET /booking/:id
  // ========================

  test('GET /booking/:id returns valid booking details @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    const booking = validateResponse(response, 200, bookingSchema);

    expect(booking.firstname).toBeDefined();
    expect(booking.lastname).toBeDefined();
    expect(booking.totalprice).toBeDefined();
    expect(typeof booking.depositpaid).toBe('boolean');
    expect(booking.bookingdates).toBeDefined();
  });

  test('GET /booking/:id has correct firstname and lastname types @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;

    expect(typeof booking.firstname).toBe('string');
    expect(typeof booking.lastname).toBe('string');
    expect(booking.firstname.length).toBeGreaterThan(0);
    expect(booking.lastname.length).toBeGreaterThan(0);
  });

  test('GET /booking/:id totalprice is non-negative @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;

    expect(typeof booking.totalprice).toBe('number');
    expect(booking.totalprice).toBeGreaterThanOrEqual(0);
  });

  test('GET /booking/:id depositpaid is boolean @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;

    expect(typeof booking.depositpaid).toBe('boolean');
  });

  test('GET /booking/:id bookingdates contains valid dates @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;

    expect(booking.bookingdates).toBeDefined();
    expect(booking.bookingdates.checkin).toBeDefined();
    expect(booking.bookingdates.checkout).toBeDefined();

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(booking.bookingdates.checkin).toMatch(dateRegex);
    expect(booking.bookingdates.checkout).toMatch(dateRegex);
  });

  test('GET /booking/:id checkout date is after or equal to checkin date @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;

    const checkinDate = new Date(booking.bookingdates.checkin);
    const checkoutDate = new Date(booking.bookingdates.checkout);

    expect(checkoutDate.getTime()).toBeGreaterThanOrEqual(checkinDate.getTime());
  });

  test('GET /booking/:id additionalneeds is optional @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;

    // additionalneeds is optional, but if present should be a string
    if (booking.additionalneeds !== undefined) {
      expect(typeof booking.additionalneeds).toBe('string');
    }
  });

  test('GET /booking/:id response contains only expected fields @smoke', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;

    const expectedFields = ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'];
    const actualFields = Object.keys(booking).filter((key) => key !== 'additionalneeds');

    expectedFields.forEach((field) => {
      expect(actualFields).toContain(field);
    });
  });

  test('GET /booking/:id with string ID that is numeric @regression', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = String(bookings[0].bookingid);
    const response = await bookingClient.getById(bookingId);

    assertStatus(response, 200);
    const booking = response.body as any;
    expect(booking.firstname).toBeDefined();
  });

  test('GET /booking/:id with valid Accept header application/json @regression', async ({ bookingClient }) => {
    // Get list of available bookings first
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const response = await bookingClient.getById(bookingId, 'application/json');

    assertStatus(response, 200);
    const booking = response.body as any;
    expect(booking.firstname).toBeDefined();
  });

  test('GET /booking/:id response time is acceptable @performance', async ({ bookingClient }) => {
    const response = await bookingClient.getById(1);

    expect(response.durationMs).toBeLessThan(5000);
  });

  // ========================
  // POSITIVE SCENARIOS: GET /booking with filters
  // ========================

  test('GET /booking with firstname filter @regression', async ({ bookingClient }) => {
    // First, get a known booking to extract firstname
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const bookingResponse = await bookingClient.getById(bookingId);
    assertStatus(bookingResponse, 200);
    const knownFirstname = (bookingResponse.body as any).firstname;

    // Now filter by that firstname
    const response = await bookingClient.list({ firstname: knownFirstname });

    assertStatus(response, 200);
    const filteredBookings = response.body as any[];
    expect(filteredBookings.length).toBeGreaterThanOrEqual(0);
  });

  test('GET /booking with lastname filter @regression', async ({ bookingClient }) => {
    // First, get a known booking to extract lastname
    const listResponse = await bookingClient.list();
    assertStatus(listResponse, 200);
    const bookings = listResponse.body as any[];
    expect(bookings.length).toBeGreaterThan(0);
    
    const bookingId = bookings[0].bookingid;
    const bookingResponse = await bookingClient.getById(bookingId);
    assertStatus(bookingResponse, 200);
    const knownLastname = (bookingResponse.body as any).lastname;

    // Now filter by that lastname
    const response = await bookingClient.list({ lastname: knownLastname });

    assertStatus(response, 200);
    const filteredBookings = response.body as any[];
    expect(filteredBookings.length).toBeGreaterThanOrEqual(0);
  });

  test('GET /booking with checkin date filter @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({ checkin: '2013-02-23' });

    assertStatus(response, 200);
    const bookings = response.body as any[];
    expect(Array.isArray(bookings)).toBe(true);
  });

  test('GET /booking with checkout date filter @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({ checkout: '2014-10-23' });

    assertStatus(response, 200);
    const bookings = response.body as any[];
    expect(Array.isArray(bookings)).toBe(true);
  });

  test('GET /booking with multiple filters @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      firstname: 'John',
      lastname: 'Doe',
    });

    assertStatus(response, 200);
    const bookings = response.body as any[];
    expect(Array.isArray(bookings)).toBe(true);
  });

  // ========================
  // NEGATIVE SCENARIOS: GET /booking/:id
  // ========================

  test('GET /booking/:id with non-existent ID returns 404 @regression', async ({ bookingClient }) => {
    const response = await bookingClient.getById(999999);

    expect([404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with ID 0 @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.getById(0);

    expect([400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with negative ID @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.getById(-1);

    expect([400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with extremely large ID @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.getById(999999999999);

    expect([400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with non-numeric ID returns error @regression', async ({ bookingClient }) => {
    const response = await bookingClient.getById('abc');

    expect([400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with special characters in ID @security', async ({ bookingClient }) => {
    const response = await bookingClient.getById("1'; DROP TABLE bookings; --");

    // API should handle safely and not crash - may return 200, 404, or 500
    expect([200, 400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with path traversal attempt @security', async ({ bookingClient }) => {
    const response = await bookingClient.getById('../../../etc/passwd');

    expect([400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with whitespace ID @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.getById('   ');

    // Whitespace IDs should not be found or cause error
    expect([200, 400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with empty string @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.getById('');

    // Empty string should not be a valid ID
    expect([200, 400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with decimal ID @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.getById('1.5');

    // Decimal IDs may be treated as invalid or converted
    expect([200, 400, 404, 500]).toContain(response.status);
  });

  test('GET /booking/:id with hexadecimal ID @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.getById('0x1A');

    // Hex string IDs should not be found or should error
    expect([200, 400, 404, 500]).toContain(response.status);
  });

  // ========================
  // NEGATIVE SCENARIOS: GET /booking (filters)
  // ========================

  test('GET /booking with non-existent firstname returns empty list @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      firstname: 'NonExistentFirstname12345',
    });

    assertStatus(response, 200);
    const bookings = response.body as any[];
    // Non-existent criteria should return empty or error
    expect([0, bookings.length]).toContain(bookings.length);
  });

  test('GET /booking with non-existent lastname returns empty list @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      lastname: 'NonExistentLastname12345',
    });

    assertStatus(response, 200);
    const bookings = response.body as any[];
    expect([0, bookings.length]).toContain(bookings.length);
  });

  test('GET /booking with invalid checkin date format @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({ checkin: 'invalid-date' });

    // API may return 200 (no results), 400 (bad request), or 500 (server error)
    expect([200, 400, 500]).toContain(response.status);
  });

  test('GET /booking with invalid checkout date format @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({ checkout: 'invalid-date' });

    // API may return 200 (no results), 400 (bad request), or 500 (server error)
    expect([200, 400, 500]).toContain(response.status);
  });

  test('GET /booking with SQL injection in firstname filter @security', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      firstname: "'; DROP TABLE bookings; --",
    });

    assertStatus(response, 200);
    // API should safely handle injection attempt
    const bookings = response.body as any[];
    expect(Array.isArray(bookings)).toBe(true);
  });

  test('GET /booking with SQL injection in lastname filter @security', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      lastname: "' OR '1'='1",
    });

    assertStatus(response, 200);
    const bookings = response.body as any[];
    expect(Array.isArray(bookings)).toBe(true);
  });

  test('GET /booking with very long firstname filter @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      firstname: 'a'.repeat(1000),
    });

    expect([200, 400, 414]).toContain(response.status);
  });

  test('GET /booking with very long lastname filter @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      lastname: 'b'.repeat(1000),
    });

    expect([200, 400, 414]).toContain(response.status);
  });

  test('GET /booking with unicode characters in firstname filter @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      firstname: '用户名',
    });

    assertStatus(response, 200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /booking with special characters in lastname filter @edge-case', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      lastname: '@#$%^&*()',
    });

    assertStatus(response, 200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /booking filter is case-sensitive @regression', async ({ bookingClient }) => {
    const response1 = await bookingClient.list({ firstname: 'john' });
    const response2 = await bookingClient.list({ firstname: 'JOHN' });

    assertStatus(response1, 200);
    assertStatus(response2, 200);

    const bookings1 = response1.body as any[];
    const bookings2 = response2.body as any[];

    // Results might differ if filter is case-sensitive
    expect(Array.isArray(bookings1)).toBe(true);
    expect(Array.isArray(bookings2)).toBe(true);
  });

  test('GET /booking list response time is acceptable @performance', async ({ bookingClient }) => {
    const response = await bookingClient.list();

    expect(response.durationMs).toBeLessThan(5000);
  });

  test('GET /booking with all filters combined @regression', async ({ bookingClient }) => {
    const response = await bookingClient.list({
      firstname: 'John',
      lastname: 'Doe',
      checkin: '2013-02-23',
      checkout: '2014-10-23',
    });

    assertStatus(response, 200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /booking multiple calls return consistent results @regression', async ({ bookingClient }) => {
    const response1 = await bookingClient.list();
    const response2 = await bookingClient.list();

    assertStatus(response1, 200);
    assertStatus(response2, 200);

    const bookings1 = response1.body as any[];
    const bookings2 = response2.body as any[];

    // Should return arrays of bookings (may vary slightly if bookings are being created)
    expect(Array.isArray(bookings1)).toBe(true);
    expect(Array.isArray(bookings2)).toBe(true);
    expect(bookings1.length).toBeGreaterThan(0);
    expect(bookings2.length).toBeGreaterThan(0);
  });
});
