import { test, expect } from '../src/fixtures/api.fixtures';
import { userListSchema, userSchema } from '../src/schemas/user.schema';
import {
  assertStatus,
  assertSchema,
  assertData,
  assertResponseTime,
  validateResponse,
} from '../src/utils/assertions';
import { buildNewUser } from '../src/utils/data-builder';

test.describe('Users API @smoke', () => {
  test('GET /users returns a valid list', async ({ usersClient }) => {
    const response = await usersClient.list();

    const users = validateResponse(response, 200, userListSchema);

    expect(users.length).toBeGreaterThan(0);
    assertResponseTime(response, 3000);
  });

  test('GET /users/:id returns a single valid user', async ({ usersClient }) => {
    const response = await usersClient.getById(1);

    const user = validateResponse(response, 200, userSchema);

    expect(user.id).toBe(1);
  });

  test('GET /users/:id with non-existent id returns 404', async ({ usersClient }) => {
    const response = await usersClient.getById(99_999);
    assertStatus(response, 404);
  });

  test('POST /users creates a user and echoes payload @regression', async ({ usersClient }) => {
    const payload = buildNewUser({ email: 'fixture@example.com' });

    const response = await usersClient.create(payload);

    assertStatus(response, 201);
    assertSchema(response, userSchema);
    assertData(response, { email: 'fixture@example.com', name: payload.name });
  });

  test('PUT /users/:id updates and returns the updated resource @regression', async ({
    usersClient,
  }) => {
    const updated = buildNewUser({ name: 'Updated Name' });

    const response = await usersClient.update(1, updated);

    assertStatus(response, 200);
    assertData(response, { name: 'Updated Name' });
  });

  test('DELETE /users/:id returns success @regression', async ({ usersClient }) => {
    const response = await usersClient.remove(1);
    assertStatus(response, [200, 204]);
  });
});