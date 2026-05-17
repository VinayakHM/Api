import { test, expect } from '../src/fixtures/api.fixtures';
import { postListSchema, postSchema } from '../src/schemas/post.schema';
import {
  assertStatus,
  assertData,
  validateResponse,
} from '../src/utils/assertions';
import { buildNewPost } from '../src/utils/data-builder';

test.describe('Posts API @smoke', () => {
  test('GET /posts returns a valid list', async ({ postsClient }) => {
    const response = await postsClient.list({ _limit: 10 });
    const posts = validateResponse(response, 200, postListSchema);
    expect(posts.length).toBeLessThanOrEqual(10);
  });

  test('GET /posts filtered by userId returns only that user\'s posts', async ({ postsClient }) => {
    const response = await postsClient.list({ userId: 1 });
    const posts = validateResponse(response, 200, postListSchema);
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

  test('POST /posts creates a post', async ({ postsClient }) => {
    const payload = buildNewPost({ userId: 2, title: 'Hello' });
    const response = await postsClient.create(payload);

    assertStatus(response, 201);
    const created = validateResponse(response, 201, postSchema);
    assertData(response, { userId: 2, title: 'Hello' });
    expect(created.id).toBeGreaterThan(0);
  });
});