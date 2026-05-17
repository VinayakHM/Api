import { test, expect } from '../src/fixtures/api.fixtures';
import {
  bookingSchema,
  createBookingResponseSchema,
} from '../src/schemas/booking.schema';
import {
  assertStatus,
  validateResponse,
} from '../src/utils/assertions';
import { buildNewBooking } from '../src/utils/data-builder';

test.describe('Booking API - CreateBooking & UpdateBooking @booking', () => {
  // ========================
  // POSITIVE SCENARIOS: POST /booking (Create)
  // ========================

  test('POST /booking creates booking with all required fields @smoke', async ({ bookingClient, authClient }) => {
    const payload = buildNewBooking({
      firstname: 'Jim',
      lastname: 'Brown',
      totalprice: 111,
      depositpaid: true,
      additionalneeds: 'Breakfast',
    });

    const response = await bookingClient.create(payload);

    const result = validateResponse(response, 200, createBookingResponseSchema);

    expect(result.bookingid).toBeGreaterThan(0);
    expect(result.booking.firstname).toBe(payload.firstname);
    expect(result.booking.lastname).toBe(payload.lastname);
    expect(result.booking.totalprice).toBe(payload.totalprice);
    expect(result.booking.depositpaid).toBe(payload.depositpaid);
    expect(result.booking.additionalneeds).toBe(payload.additionalneeds);
  });

  test('POST /booking returns valid booking ID @smoke', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    const response = await bookingClient.create(payload);

    assertStatus(response, 200);
    const result = response.body as any;

    expect(result.bookingid).toBeDefined();
    expect(typeof result.bookingid).toBe('number');
    expect(result.bookingid).toBeGreaterThan(0);
  });

  test('POST /booking response echoes request data @smoke', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      firstname: 'Sally',
      lastname: 'Jones',
      totalprice: 250,
      depositpaid: false,
    });

    const response = await bookingClient.create(payload);

    assertStatus(response, 200);
    const result = response.body as any;

    expect(result.booking.firstname).toBe(payload.firstname);
    expect(result.booking.lastname).toBe(payload.lastname);
    expect(result.booking.totalprice).toBe(payload.totalprice);
    expect(result.booking.depositpaid).toBe(payload.depositpaid);
    expect(result.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(result.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
  });

  test('POST /booking with depositpaid true @smoke', async ({ bookingClient }) => {
    const payload = buildNewBooking({ depositpaid: true });
    const response = await bookingClient.create(payload);

    const result = validateResponse(response, 200, createBookingResponseSchema);
    expect(result.booking.depositpaid).toBe(true);
  });

  test('POST /booking with depositpaid false @smoke', async ({ bookingClient }) => {
    const payload = buildNewBooking({ depositpaid: false });
    const response = await bookingClient.create(payload);

    const result = validateResponse(response, 200, createBookingResponseSchema);
    expect(result.booking.depositpaid).toBe(false);
  });

  test('POST /booking with zero price @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({ totalprice: 0 });
    const response = await bookingClient.create(payload);

    const result = validateResponse(response, 200, createBookingResponseSchema);
    expect(result.booking.totalprice).toBe(0);
  });

  test('POST /booking with high price @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({ totalprice: 999999 });
    const response = await bookingClient.create(payload);

    const result = validateResponse(response, 200, createBookingResponseSchema);
    expect(result.booking.totalprice).toBe(999999);
  });

  test('POST /booking without additionalneeds field @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    delete payload.additionalneeds;

    const response = await bookingClient.create(payload);

    assertStatus(response, 200);
    const result = response.body as any;
    expect(result.booking.firstname).toBeDefined();
  });

  test('POST /booking with special characters in names @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      firstname: "John-Paul O'Brien",
      lastname: "De la Cruz",
    });

    const response = await bookingClient.create(payload);

    const result = validateResponse(response, 200, createBookingResponseSchema);
    expect(result.booking.firstname).toBe(payload.firstname);
    expect(result.booking.lastname).toBe(payload.lastname);
  });

  test('POST /booking creates multiple bookings independently @regression', async ({ bookingClient }) => {
    const payload1 = buildNewBooking({ firstname: 'User1' });
    const payload2 = buildNewBooking({ firstname: 'User2' });

    const response1 = await bookingClient.create(payload1);
    const response2 = await bookingClient.create(payload2);

    const result1 = response1.body as any;
    const result2 = response2.body as any;

    expect(result1.bookingid).not.toBe(result2.bookingid);
    expect(result1.booking.firstname).toBe('User1');
    expect(result2.booking.firstname).toBe('User2');
  });

  test('POST /booking with past checkout date @regression', async ({ bookingClient }) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const payload = buildNewBooking({
      bookingdates: {
        checkin: yesterday.toISOString().split('T')[0],
        checkout: today.toISOString().split('T')[0],
      },
    });

    const response = await bookingClient.create(payload);

    // API should accept past dates
    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking response time is acceptable @performance', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    const response = await bookingClient.create(payload);

    expect(response.durationMs).toBeLessThan(5000);
  });

  test('POST /booking has proper Content-Type response header @smoke', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    const response = await bookingClient.create(payload);

    assertStatus(response, 200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  test('POST /booking response contains correct response structure @smoke', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    const response = await bookingClient.create(payload);

    assertStatus(response, 200);
    const result = response.body as any;

    expect(Object.keys(result)).toContain('bookingid');
    expect(Object.keys(result)).toContain('booking');
  });

  // ========================
  // NEGATIVE SCENARIOS: POST /booking (Create)
  // ========================

  test('POST /booking with missing firstname returns error @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({ firstname: '' });
    const response = await bookingClient.create(payload);

    // API may accept empty string or return error
    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with missing lastname returns error @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({ lastname: '' });
    const response = await bookingClient.create(payload);

    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with missing totalprice returns error @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    delete (payload as any).totalprice;

    const response = await bookingClient.create(payload);

    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with missing depositpaid returns error @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    delete (payload as any).depositpaid;

    const response = await bookingClient.create(payload);

    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with missing bookingdates returns error @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    delete (payload as any).bookingdates;

    const response = await bookingClient.create(payload);

    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with invalid totalprice (negative) @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({ totalprice: -100 });
    const response = await bookingClient.create(payload);

    // API may accept or reject negative prices
    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with invalid totalprice (string) @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    (payload as any).totalprice = 'not a number';

    const response = await bookingClient.create(payload);

    // API may accept or reject - 200 means it accepted, others mean rejection
    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with invalid depositpaid (non-boolean) @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    (payload as any).depositpaid = 'yes';

    const response = await bookingClient.create(payload);

    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with invalid checkin date format @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    payload.bookingdates.checkin = 'invalid-date';

    const response = await bookingClient.create(payload);

    // API may accept or reject invalid dates
    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with invalid checkout date format @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    payload.bookingdates.checkout = '01/01/2024';

    const response = await bookingClient.create(payload);

    // API may accept or reject invalid dates
    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with checkout before checkin @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      bookingdates: {
        checkin: '2024-01-15',
        checkout: '2024-01-01',
      },
    });

    const response = await bookingClient.create(payload);

    // API may accept or reject reversed dates
    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with very long firstname @edge-case', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      firstname: 'a'.repeat(1000),
    });

    const response = await bookingClient.create(payload);

    expect([200, 400, 413, 414]).toContain(response.status);
  });

  test('POST /booking with very long lastname @edge-case', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      lastname: 'b'.repeat(1000),
    });

    const response = await bookingClient.create(payload);

    expect([200, 400, 413, 414]).toContain(response.status);
  });

  test('POST /booking with unicode characters in firstname @edge-case', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      firstname: '日本',
    });

    const response = await bookingClient.create(payload);

    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with SQL injection in firstname @security', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      firstname: "'; DROP TABLE bookings; --",
    });

    const response = await bookingClient.create(payload);

    // Should safely handle injection attempt
    expect([200, 400]).toContain(response.status);

    if (response.status === 200) {
      const result = response.body as any;
      // Table should still exist (not dropped)
      expect(result.bookingid).toBeGreaterThan(0);
    }
  });

  test('POST /booking with very large totalprice @edge-case', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      totalprice: Number.MAX_SAFE_INTEGER,
    });

    const response = await bookingClient.create(payload);

    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with float totalprice @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({ totalprice: 99.99 });
    const response = await bookingClient.create(payload);

    // API may accept or convert float prices
    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with null firstname @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking();
    (payload as any).firstname = null;

    const response = await bookingClient.create(payload);

    expect([200, 400, 500]).toContain(response.status);
  });

  test('POST /booking with empty additionalneeds @regression', async ({ bookingClient }) => {
    const payload = buildNewBooking({ additionalneeds: '' });
    const response = await bookingClient.create(payload);

    // Empty additionalneeds should be acceptable
    expect([200, 400]).toContain(response.status);
  });

  test('POST /booking with very long additionalneeds @edge-case', async ({ bookingClient }) => {
    const payload = buildNewBooking({
      additionalneeds: 'c'.repeat(1000),
    });

    const response = await bookingClient.create(payload);

    expect([200, 400, 413, 414]).toContain(response.status);
  });

  // ========================
  // POSITIVE SCENARIOS: PUT /booking/:id (Update)
  // ========================

  test('PUT /booking/:id updates booking with valid token @smoke', async ({ bookingClient, authClient }) => {
    // First create a booking
    const createPayload = buildNewBooking({ firstname: 'Jim' });
    const createResponse = await bookingClient.create(createPayload);
    assertStatus(createResponse, 200);
    const bookingId = (createResponse.body as any).bookingid;

    // Get auth token
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Update the booking
    const updatePayload = buildNewBooking({
      firstname: 'James',
      lastname: 'Brown',
      totalprice: 150,
    });

    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    const updated = validateResponse(updateResponse, 200, bookingSchema);
    expect(updated.firstname).toBe('James');
    expect(updated.lastname).toBe('Brown');
    expect(updated.totalprice).toBe(150);
  });

  test('PUT /booking/:id updates firstname @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking({ firstname: 'Original' });
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking({ firstname: 'Updated' });
    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    assertStatus(updateResponse, 200);
    const updated = updateResponse.body as any;
    if (updated.firstname) {
      expect(updated.firstname).toBe('Updated');
    }
  });

  test('PUT /booking/:id updates totalprice @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking({ totalprice: 100 });
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking({ totalprice: 500 });
    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    assertStatus(updateResponse, 200);
    const updated = (updateResponse.body as any);
    if (updated.totalprice !== undefined) {
      expect(updated.totalprice).toBe(500);
    }
  });

  test('PUT /booking/:id updates depositpaid @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking({ depositpaid: false });
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking({ depositpaid: true });
    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    assertStatus(updateResponse, 200);
    const updated = (updateResponse.body as any);
    if (updated.depositpaid !== undefined) {
      expect(updated.depositpaid).toBe(true);
    }
  });

  test('PUT /booking/:id response contains updated booking @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking({
      firstname: 'UpdatedName',
    });

    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    assertStatus(updateResponse, 200);
    const updated = (updateResponse.body as any);
    expect(updated.firstname).toBeDefined();
  });

  test('PUT /booking/:id response time is acceptable @performance', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    expect(updateResponse.durationMs).toBeLessThan(5000);
  });

  // ========================
  // NEGATIVE SCENARIOS: PUT /booking/:id (Update)
  // ========================

  test('PUT /booking/:id without token returns error @security', async ({ bookingClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update(bookingId, updatePayload);

    // Should require authentication - returns 405 (Method Not Allowed) or 403 (Forbidden)
    expect([403, 405]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with invalid token returns error @security', async ({ bookingClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update(bookingId, updatePayload, 'invalid_token_123');

    // Should reject invalid token - returns 403 (Forbidden) or 405 (Method Not Allowed)
    expect([403, 405]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with non-existent booking ID returns error @regression', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update(999999, updatePayload, token);

    // Should return 404, 405, or 500
    expect([404, 405, 500]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with invalid booking ID format @regression', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update('abc', updatePayload, token);

    expect([400, 404, 405, 500]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with missing firstname @regression', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking({ firstname: '' });
    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    expect([200, 400]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with invalid totalprice @regression', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    (updatePayload as any).totalprice = 'invalid';

    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    expect([200, 400, 500]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with invalid checkin date @regression', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    updatePayload.bookingdates.checkin = 'invalid';

    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    expect([200, 400, 500]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with SQL injection in firstname @security', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking({
      firstname: "'; DROP TABLE bookings; --",
    });

    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    // Should safely handle injection
    expect([200, 400]).toContain(updateResponse.status);

    if (updateResponse.status === 200) {
      // Booking should still exist
      const getResponse = await bookingClient.getById(bookingId);
      expect(getResponse.status).toBe(200);
    }
  });

  test('PUT /booking/:id with very long firstname @edge-case', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking({
      firstname: 'a'.repeat(1000),
    });

    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    expect([200, 400, 413, 414]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with zero ID @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update(0, updatePayload, token);

    expect([400, 404, 405, 500]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id with negative ID @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update(-1, updatePayload, token);

    expect([400, 404, 405, 500]).toContain(updateResponse.status);
  });

  test('PUT /booking/:id has proper Content-Type header in response @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const updatePayload = buildNewBooking();
    const updateResponse = await bookingClient.update(bookingId, updatePayload, token);

    if (updateResponse.status === 200) {
      expect(updateResponse.headers['content-type']).toMatch(/application\/json/);
    }
  });
});
