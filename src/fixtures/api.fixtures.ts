import { test as base } from "@playwright/test";
import { UsersClient } from "../clients/users.client";
import { PostsClient } from "../clients/posts.client";

interface ApiFixtures {
  usersClient: UsersClient;
  postsClient: PostsClient;
}

/**
 * Extended test object - usage:
 * import { test, expect } from "@playwright/test";
 * test('something', async({usersClient}))=>{...});
 *
 * To add a new client: register a fixture below, and tests can request it by name.
 */

export const test = base.extend<ApiFixtures>({
  usersClient: async ({ request }, use) => {
    await use(new UsersClient(request));
  },
  postsClient: async ({ request }, use) => {
    await use(new PostsClient(request));
  },
});

export { expect } from "@playwright/test";
