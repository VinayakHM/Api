import { BaseClient } from './base.client';
import type { User, NewUser } from '../schemas/user.schema';

export class UsersClient extends BaseClient {
  list(params?: { _limit?: number; _start?: number }) {
    return this.get<User[]>('/users', { params });
  }

  getById(id: number) {
    return this.get<User>(`/users/${id}`);
  }

  create(payload: NewUser) {
    return this.post<User>('/users', { data: payload });
  }

  update(id: number, payload: Partial<NewUser>) {
    return this.put<User>(`/users/${id}`, { data: payload });
  }

  patch_(id: number, payload: Partial<NewUser>) {
    return this.patch<User>(`/users/${id}`, { data: payload });
  }

  remove(id: number) {
    return this.delete<unknown>(`/users/${id}`);
  }
}