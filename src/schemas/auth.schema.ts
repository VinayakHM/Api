import { z } from 'zod';

export const authRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const authResponseSchema = z.object({
  token: z.string().min(1, 'Token must not be empty'),
});

export const authErrorResponseSchema = z.object({
  reason: z.string(),
});

export type AuthRequest = z.infer<typeof authRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthErrorResponse = z.infer<typeof authErrorResponseSchema>;
