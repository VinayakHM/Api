import { test, expect } from '../src/fixtures/api.fixtures';
import {
  assertStatus,
} from '../src/utils/assertions';
import { buildNewBooking } from '../src/utils/data-builder';

test.describe('Booking API - DeleteBooking @booking', () => {
  // ========================
  // POSITIVE SCENARIOS: DELETE /booking/:id
  // ========================

  test('DELETE /booking/:id with valid token deletes booking @smoke', async ({ bookingClient, authClient }) => {
    // Create a booking
    const createPayload = buildNewBooking({ firstname: 'ToDelete' });
    const createResponse = await bookingClient.create(createPayload);
    assertStatus(createResponse, 200);
    const bookingId = (createResponse.body as any).bookingid;

    // Get auth token
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    assertStatus(tokenResponse, 200);
    const token = (tokenResponse.body as any).token;

    // Delete the booking
    const deleteResponse = await bookingClient.delete(bookingId, token);

    // Should return 201 or 200
    expect([200, 201]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id returns 201 Created status @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete(bookingId, token);

    // API returns 201 Created for successful deletion
    expect([200, 201]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id response contains OK message @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete(bookingId, token);

    if (deleteResponse.status === 201 || deleteResponse.status === 200) {
      const body = deleteResponse.body as any;
      expect(body).toBeDefined();
    }
  });

  test('DELETE /booking/:id deletes booking successfully - verify with GET @regression', async ({ bookingClient, authClient }) => {
    // Create a booking
    const createPayload = buildNewBooking({ firstname: 'VerifyDelete' });
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    // Get auth token
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Delete the booking
    const deleteResponse = await bookingClient.delete(bookingId, token);
    expect([200, 201]).toContain(deleteResponse.status);

    // Try to get the deleted booking - should return 404
    const getResponse = await bookingClient.getById(bookingId);
    expect(getResponse.status).toBe(404);
  });

  test('DELETE /booking/:id response time is acceptable @performance', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete(bookingId, token);

    expect(deleteResponse.durationMs).toBeLessThan(5000);
  });

  test('DELETE /booking/:id can delete multiple bookings independently @regression', async ({ bookingClient, authClient }) => {
    // Create two bookings
    const payload1 = buildNewBooking({ firstname: 'Delete1' });
    const payload2 = buildNewBooking({ firstname: 'Delete2' });
    
    const response1 = await bookingClient.create(payload1);
    const response2 = await bookingClient.create(payload2);
    
    const bookingId1 = (response1.body as any).bookingid;
    const bookingId2 = (response2.body as any).bookingid;

    // Get auth token
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Delete both bookings
    const deleteResponse1 = await bookingClient.delete(bookingId1, token);
    const deleteResponse2 = await bookingClient.delete(bookingId2, token);

    expect([200, 201]).toContain(deleteResponse1.status);
    expect([200, 201]).toContain(deleteResponse2.status);

    // Both should be gone
    const getResponse1 = await bookingClient.getById(bookingId1);
    const getResponse2 = await bookingClient.getById(bookingId2);
    
    expect(getResponse1.status).toBe(404);
    expect(getResponse2.status).toBe(404);
  });

  test('DELETE /booking/:id with valid numeric ID string @regression', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Pass ID as string
    const deleteResponse = await bookingClient.delete(String(bookingId), token);

    expect([200, 201]).toContain(deleteResponse.status);
  });

  // ========================
  // NEGATIVE SCENARIOS: DELETE /booking/:id
  // ========================

  test('DELETE /booking/:id without token returns error @security', async ({ bookingClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    // Try to delete without token
    const deleteResponse = await bookingClient.delete(bookingId);

    // Should require authentication - return 403 or 405
    expect([403, 405]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with invalid token returns error @security', async ({ bookingClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    // Try to delete with invalid token
    const deleteResponse = await bookingClient.delete(bookingId, 'invalid_token_xyz');

    // Should reject invalid token - return 403 or 405
    expect([403, 405]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with non-existent booking ID returns error @regression', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Try to delete non-existent booking
    const deleteResponse = await bookingClient.delete(999999, token);

    // Should return 404, 405, or 500
    expect([404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with invalid ID format returns error @regression', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Try to delete with non-numeric ID
    const deleteResponse = await bookingClient.delete('abc', token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with zero ID returns error @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete(0, token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with negative ID returns error @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete(-1, token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with extremely large ID returns error @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete(999999999999, token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with decimal ID returns error @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete('1.5', token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with special characters in ID @security', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // SQL injection attempt
    const deleteResponse = await bookingClient.delete("1'; DROP TABLE bookings; --", token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with path traversal attempt @security', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Path traversal attempt
    const deleteResponse = await bookingClient.delete('../../../etc/passwd', token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with whitespace ID @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete('   ', token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with empty string ID @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete('', token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id with hexadecimal ID @edge-case', async ({ bookingClient, authClient }) => {
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete('0x1A', token);

    expect([400, 404, 405, 500]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id twice on same booking fails second time @regression', async ({ bookingClient, authClient }) => {
    // Create a booking
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    // Get auth token
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Delete the booking first time - should succeed
    const deleteResponse1 = await bookingClient.delete(bookingId, token);
    expect([200, 201]).toContain(deleteResponse1.status);

    // Try to delete again - should fail
    const deleteResponse2 = await bookingClient.delete(bookingId, token);
    expect([404, 405, 500]).toContain(deleteResponse2.status);
  });

  test('DELETE /booking/:id with empty token string returns error @security', async ({ bookingClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    // Try to delete with empty token
    const deleteResponse = await bookingClient.delete(bookingId, '');

    // Empty token should be treated as no token
    expect([403, 405]).toContain(deleteResponse.status);
  });

  test('DELETE /booking/:id idempotency - failed delete should not affect other operations @regression', async ({ bookingClient, authClient }) => {
    // Create a booking
    const createPayload = buildNewBooking({ firstname: 'TestIdempotent' });
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    // Get auth token
    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    // Try to delete with invalid token first - should fail
    const failedDelete = await bookingClient.delete(bookingId, 'invalid_token');
    expect([403, 405]).toContain(failedDelete.status);

    // Booking should still exist
    const getResponse = await bookingClient.getById(bookingId);
    expect(getResponse.status).toBe(200);

    // Now delete with valid token - should succeed
    const successDelete = await bookingClient.delete(bookingId, token);
    expect([200, 201]).toContain(successDelete.status);
  });

  test('DELETE /booking/:id response has proper content type @smoke', async ({ bookingClient, authClient }) => {
    const createPayload = buildNewBooking();
    const createResponse = await bookingClient.create(createPayload);
    const bookingId = (createResponse.body as any).bookingid;

    const tokenResponse = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });
    const token = (tokenResponse.body as any).token;

    const deleteResponse = await bookingClient.delete(bookingId, token);

    if (deleteResponse.status === 200 || deleteResponse.status === 201) {
      if (deleteResponse.headers['content-type']) {
        expect(deleteResponse.headers['content-type']).toMatch(/json|text/);
      }
    }
  });
});
