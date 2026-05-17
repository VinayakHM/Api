import { test, expect } from '../src/fixtures/api.fixtures';
import { userSchema } from '../src/schemas/user.schema';
import { postListSchema } from '../src/schemas/post.schema';
import { validateResponse } from '../src/utils/assertions';

test.describe('Cross-resource data integrity @regression', () => {
  test('Every post returned for a user references that same userId', async ({
    usersClient,
    postsClient,
  }) => {
    const userResponse = await usersClient.getById(1);
    const user = validateResponse(userResponse, 200, userSchema);

    const postsResponse = await postsClient.listByUser(user.id);
    const posts = validateResponse(postsResponse, 200, postListSchema);

    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.userId).toBe(user.id);
    }
  });

  test('List of users contains no duplicate ids or emails', async ({ usersClient }) => {
    const response = await usersClient.list();
    const users = response.body as Array<{ id: number; email: string }>;

    const ids = users.map((u) => u.id);
    const emails = users.map((u) => u.email.toLowerCase());

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(emails).size).toBe(emails.length);
  });
});