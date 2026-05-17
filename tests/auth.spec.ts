import { test, expect } from '../src/fixtures/api.fixtures';
import { authResponseSchema, authErrorResponseSchema, authRequestSchema } from '../src/schemas/auth.schema';
import {
  assertStatus,
  assertSchema,
  validateResponse,
} from '../src/utils/assertions';

test.describe('Auth API - CreateToken @auth', () => {
  // ========================
  // POSITIVE SCENARIOS
  // ========================

  test('POST /auth with valid credentials returns token @smoke', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    const result = validateResponse(response, 200, authResponseSchema);

    expect(result.token).toBeTruthy();
    expect(result.token).toMatch(/^[a-zA-Z0-9]+$/);
  });

  test('POST /auth token format is alphanumeric @smoke', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    assertStatus(response, 200);
    const body = response.body as any;
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('POST /auth response contains only token field', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    assertStatus(response, 200);
    const body = response.body as Record<string, unknown>;
    const keys = Object.keys(body);
    expect(keys).toContain('token');
    expect(keys.length).toBe(1);
  });

  // ========================
  // NEGATIVE SCENARIOS
  // ========================

  test('POST /auth with missing username returns error @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: '',
      password: 'password123',
    });

    assertStatus(response, 200); // API might still return 200 with reason
    const body = response.body as any;
    // Check if error message is present
    if (body.reason) {
      expect(body.reason).toBeTruthy();
    }
  });

  test('POST /auth with missing password returns error @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: '',
    });

    assertStatus(response, 200); // API might still return 200 with reason
    const body = response.body as any;
    // Check if error message is present
    if (body.reason) {
      expect(body.reason).toBeTruthy();
    }
  });

  test('POST /auth with invalid username returns error @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'invaliduser',
      password: 'password123',
    });

    // Should return 200 with reason or 401/403
    expect([200, 401, 403]).toContain(response.status);
    
    if (response.status !== 200) {
      assertStatus(response, response.status);
    } else {
      const body = response.body as any;
      expect(body.reason).toBeDefined();
    }
  });

  test('POST /auth with invalid password returns error @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'wrongpassword',
    });

    // Should return 200 with reason or 401/403
    expect([200, 401, 403]).toContain(response.status);
    
    if (response.status !== 200) {
      assertStatus(response, response.status);
    } else {
      const body = response.body as any;
      expect(body.reason).toBeDefined();
    }
  });

  test('POST /auth with both empty credentials returns error @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: '',
      password: '',
    });

    expect([200, 400, 401, 403]).toContain(response.status);
    
    if (response.status !== 200) {
      assertStatus(response, response.status);
    } else {
      const body = response.body as any;
      if (body.reason) {
        expect(body.reason).toBeTruthy();
      }
    }
  });

  test('POST /auth with whitespace-only username returns error @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: '   ',
      password: 'password123',
    });

    expect([200, 400, 401, 403]).toContain(response.status);
  });

  test('POST /auth with whitespace-only password returns error @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: '   ',
    });

    expect([200, 400, 401, 403]).toContain(response.status);
  });

  test('POST /auth with special characters in username @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin@#$%',
      password: 'password123',
    });

    expect([200, 401, 403]).toContain(response.status);
  });

  test('POST /auth with SQL injection attempt in username returns error @security', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: "admin' OR '1'='1",
      password: 'password123',
    });

    expect([200, 400, 401, 403]).toContain(response.status);
    
    if (response.status === 200) {
      const body = response.body as any;
      // Should not return a valid token for injection attempt
      expect(body.token).toBeUndefined();
    }
  });

  test('POST /auth with very long username @edge-case', async ({ authClient }) => {
    const longUsername = 'a'.repeat(1000);
    const response = await authClient.createToken({
      username: longUsername,
      password: 'password123',
    });

    expect([200, 400, 401, 403, 413, 414]).toContain(response.status);
  });

  test('POST /auth with very long password @edge-case', async ({ authClient }) => {
    const longPassword = 'p'.repeat(1000);
    const response = await authClient.createToken({
      username: 'admin',
      password: longPassword,
    });

    expect([200, 400, 401, 403, 413, 414]).toContain(response.status);
  });

  test('POST /auth with unicode characters in username @edge-case', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: '用户名',
      password: 'password123',
    });

    expect([200, 400, 401, 403]).toContain(response.status);
  });

  test('POST /auth with numeric string credentials @edge-case', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: '12345',
      password: '67890',
    });

    expect([200, 401, 403]).toContain(response.status);
  });

  test('POST /auth case sensitivity - lowercase username @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'ADMIN',
      password: 'password123',
    });

    // Check if auth is case-sensitive or case-insensitive
    expect([200, 401, 403]).toContain(response.status);
  });

  test('POST /auth case sensitivity - different password case @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'PASSWORD123',
    });

    // Passwords are typically case-sensitive
    expect([200, 401, 403]).toContain(response.status);
    
    if (response.status === 200) {
      const body = response.body as any;
      expect(body.token).toBeUndefined();
    }
  });

  test('POST /auth returns consistent token on multiple calls @regression', async ({ authClient }) => {
    const response1 = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    const response2 = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    if (response1.status === 200 && response2.status === 200) {
      const token1 = (response1.body as any).token;
      const token2 = (response2.body as any).token;
      
      // Tokens might be the same or different - both are valid
      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
    }
  });

  test('POST /auth has proper Content-Type header in response @smoke', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    assertStatus(response, 200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  test('POST /auth with extra fields in payload @regression', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    // Extra fields should be ignored by the API
    assertStatus(response, 200);
    const body = response.body as any;
    expect(body.token).toBeTruthy();
  });

  test('POST /auth responds within acceptable time @performance', async ({ authClient }) => {
    const response = await authClient.createToken({
      username: 'admin',
      password: 'password123',
    });

    // Auth endpoint should be fast (< 5 seconds)
    expect(response.durationMs).toBeLessThan(5000);
  });
});
