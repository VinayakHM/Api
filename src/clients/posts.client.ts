import { BaseClient } from './base.client';
import type { Post, NewPost } from '../schemas/post.schema';

export class PostsClient extends BaseClient {
  list(params?: { userId?: number; _limit?: number }) {
    return this.get<Post[]>('/posts', { params });
  }

  getById(id: number) {
    return this.get<Post>(`/posts/${id}`);
  }

  listByUser(userId: number) {
    return this.get<Post[]>(`/users/${userId}/posts`);
  }

  create(payload: NewPost) {
    return this.post<Post>('/posts', { data: payload });
  }

  update(id: number, payload: Partial<NewPost>) {
    return this.put<Post>(`/posts/${id}`, { data: payload });
  }

  remove(id: number) {
    return this.delete<unknown>(`/posts/${id}`);
  }
}