import { BaseClient } from './base.client';
import type { AuthRequest, AuthResponse } from '../schemas/auth.schema';

export class AuthClient extends BaseClient {
  constructor(request: any) {
    // Use the restful-booker API for auth
    super(request, 'https://restful-booker.herokuapp.com');
  }

  /**
   * Creates a new authentication token
   * @param payload - Authentication credentials (username and password)
   * @returns Promise with token in response body
   */
  createToken(payload: AuthRequest) {
    return this.post<AuthResponse>('/auth', { data: payload });
  }
}
