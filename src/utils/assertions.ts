import { expect } from '@playwright/test';
import type { ZodSchema } from 'zod';
import type { ApiResponse } from '../types/http';
import { logger } from './logger';

/**
 * Three pillars of API response validation:
 *  1. assertStatus  - HTTP contract (status code)
 *  2. assertSchema  - structural contract (Zod schema)
 *  3. assertData    - business-rule integrity (field-level expectations)
 */

export function assertStatus<T>(response: ApiResponse<T>, expected: number | number[]): void {
  const allowed = Array.isArray(expected) ? expected : [expected];
  expect(
    allowed,
    `Expected status ${allowed.join(' or ')} but got ${response.status}. Body: ${JSON.stringify(response.body)}`,
  ).toContain(response.status);
}

export function assertSchema<T>(response: ApiResponse<unknown>, schema: ZodSchema<T>): T {
  const result = schema.safeParse(response.body);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('\n');
    logger.error('Schema validation failed', { issues: result.error.issues });
    throw new Error(`Response failed schema validation:\n${issues}`);
  }
  return result.data;
}

/**
 * Asserts that the response body matches a partial expected shape.
 * Useful for "did the field I sent come back unchanged" checks.
 */
export function assertData<T extends object>(
  response: ApiResponse<T>,
  expected: Partial<T>,
): void {
  expect(response.body).toMatchObject(expected);
}

/**
 * Asserts response time is within an SLO threshold (ms).
 */
export function assertResponseTime(response: ApiResponse<unknown>, maxMs: number): void {
  expect(
    response.durationMs,
    `Response took ${response.durationMs}ms, exceeds SLO of ${maxMs}ms`,
  ).toBeLessThanOrEqual(maxMs);
}

/**
 * Convenience: status + schema in one call. Returns the parsed body for further assertions.
 */
export function validateResponse<T>(
  response: ApiResponse<unknown>,
  expectedStatus: number | number[],
  schema: ZodSchema<T>,
): T {
  assertStatus(response, expectedStatus);
  return assertSchema(response, schema);
}