# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> Booking API - GetBooking @booking >> GET /booking/:id totalprice is non-negative @smoke
- Location: tests/bookings.spec.ts:86:7

# Error details

```
Error: Expected status 200 but got 404. Body: "Not Found"

expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200]
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import type { ZodSchema } from 'zod';
  3  | import type { ApiResponse } from '../types/http';
  4  | import { logger } from './logger';
  5  | 
  6  | /**
  7  |  * Three pillars of API response validation:
  8  |  *  1. assertStatus  - HTTP contract (status code)
  9  |  *  2. assertSchema  - structural contract (Zod schema)
  10 |  *  3. assertData    - business-rule integrity (field-level expectations)
  11 |  */
  12 | 
  13 | export function assertStatus<T>(response: ApiResponse<T>, expected: number | number[]): void {
  14 |   const allowed = Array.isArray(expected) ? expected : [expected];
  15 |   expect(
  16 |     allowed,
  17 |     `Expected status ${allowed.join(' or ')} but got ${response.status}. Body: ${JSON.stringify(response.body)}`,
> 18 |   ).toContain(response.status);
     |     ^ Error: Expected status 200 but got 404. Body: "Not Found"
  19 | }
  20 | 
  21 | export function assertSchema<T>(response: ApiResponse<unknown>, schema: ZodSchema<T>): T {
  22 |   const result = schema.safeParse(response.body);
  23 |   if (!result.success) {
  24 |     const issues = result.error.issues
  25 |       .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
  26 |       .join('\n');
  27 |     logger.error('Schema validation failed', { issues: result.error.issues });
  28 |     throw new Error(`Response failed schema validation:\n${issues}`);
  29 |   }
  30 |   return result.data;
  31 | }
  32 | 
  33 | /**
  34 |  * Asserts that the response body matches a partial expected shape.
  35 |  * Useful for "did the field I sent come back unchanged" checks.
  36 |  */
  37 | export function assertData<T extends object>(
  38 |   response: ApiResponse<T>,
  39 |   expected: Partial<T>,
  40 | ): void {
  41 |   expect(response.body).toMatchObject(expected);
  42 | }
  43 | 
  44 | /**
  45 |  * Asserts response time is within an SLO threshold (ms).
  46 |  */
  47 | export function assertResponseTime(response: ApiResponse<unknown>, maxMs: number): void {
  48 |   expect(
  49 |     response.durationMs,
  50 |     `Response took ${response.durationMs}ms, exceeds SLO of ${maxMs}ms`,
  51 |   ).toBeLessThanOrEqual(maxMs);
  52 | }
  53 | 
  54 | /**
  55 |  * Convenience: status + schema in one call. Returns the parsed body for further assertions.
  56 |  */
  57 | export function validateResponse<T>(
  58 |   response: ApiResponse<unknown>,
  59 |   expectedStatus: number | number[],
  60 |   schema: ZodSchema<T>,
  61 | ): T {
  62 |   assertStatus(response, expectedStatus);
  63 |   return assertSchema(response, schema);
  64 | }
```