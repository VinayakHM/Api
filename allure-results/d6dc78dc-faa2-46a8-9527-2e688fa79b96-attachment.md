# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> Booking API - GetBooking @booking >> GET /booking multiple calls return consistent results @regression
- Location: tests/bookings.spec.ts:438:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1966
Received: 1963
```

# Test source

```ts
  349 | 
  350 |   test('GET /booking with SQL injection in firstname filter @security', async ({ bookingClient }) => {
  351 |     const response = await bookingClient.list({
  352 |       firstname: "'; DROP TABLE bookings; --",
  353 |     });
  354 | 
  355 |     assertStatus(response, 200);
  356 |     // API should safely handle injection attempt
  357 |     const bookings = response.body as any[];
  358 |     expect(Array.isArray(bookings)).toBe(true);
  359 |   });
  360 | 
  361 |   test('GET /booking with SQL injection in lastname filter @security', async ({ bookingClient }) => {
  362 |     const response = await bookingClient.list({
  363 |       lastname: "' OR '1'='1",
  364 |     });
  365 | 
  366 |     assertStatus(response, 200);
  367 |     const bookings = response.body as any[];
  368 |     expect(Array.isArray(bookings)).toBe(true);
  369 |   });
  370 | 
  371 |   test('GET /booking with very long firstname filter @edge-case', async ({ bookingClient }) => {
  372 |     const response = await bookingClient.list({
  373 |       firstname: 'a'.repeat(1000),
  374 |     });
  375 | 
  376 |     expect([200, 400, 414]).toContain(response.status);
  377 |   });
  378 | 
  379 |   test('GET /booking with very long lastname filter @edge-case', async ({ bookingClient }) => {
  380 |     const response = await bookingClient.list({
  381 |       lastname: 'b'.repeat(1000),
  382 |     });
  383 | 
  384 |     expect([200, 400, 414]).toContain(response.status);
  385 |   });
  386 | 
  387 |   test('GET /booking with unicode characters in firstname filter @edge-case', async ({ bookingClient }) => {
  388 |     const response = await bookingClient.list({
  389 |       firstname: '用户名',
  390 |     });
  391 | 
  392 |     assertStatus(response, 200);
  393 |     expect(Array.isArray(response.body)).toBe(true);
  394 |   });
  395 | 
  396 |   test('GET /booking with special characters in lastname filter @edge-case', async ({ bookingClient }) => {
  397 |     const response = await bookingClient.list({
  398 |       lastname: '@#$%^&*()',
  399 |     });
  400 | 
  401 |     assertStatus(response, 200);
  402 |     expect(Array.isArray(response.body)).toBe(true);
  403 |   });
  404 | 
  405 |   test('GET /booking filter is case-sensitive @regression', async ({ bookingClient }) => {
  406 |     const response1 = await bookingClient.list({ firstname: 'john' });
  407 |     const response2 = await bookingClient.list({ firstname: 'JOHN' });
  408 | 
  409 |     assertStatus(response1, 200);
  410 |     assertStatus(response2, 200);
  411 | 
  412 |     const bookings1 = response1.body as any[];
  413 |     const bookings2 = response2.body as any[];
  414 | 
  415 |     // Results might differ if filter is case-sensitive
  416 |     expect(Array.isArray(bookings1)).toBe(true);
  417 |     expect(Array.isArray(bookings2)).toBe(true);
  418 |   });
  419 | 
  420 |   test('GET /booking list response time is acceptable @performance', async ({ bookingClient }) => {
  421 |     const response = await bookingClient.list();
  422 | 
  423 |     expect(response.durationMs).toBeLessThan(5000);
  424 |   });
  425 | 
  426 |   test('GET /booking with all filters combined @regression', async ({ bookingClient }) => {
  427 |     const response = await bookingClient.list({
  428 |       firstname: 'John',
  429 |       lastname: 'Doe',
  430 |       checkin: '2013-02-23',
  431 |       checkout: '2014-10-23',
  432 |     });
  433 | 
  434 |     assertStatus(response, 200);
  435 |     expect(Array.isArray(response.body)).toBe(true);
  436 |   });
  437 | 
  438 |   test('GET /booking multiple calls return consistent results @regression', async ({ bookingClient }) => {
  439 |     const response1 = await bookingClient.list();
  440 |     const response2 = await bookingClient.list();
  441 | 
  442 |     assertStatus(response1, 200);
  443 |     assertStatus(response2, 200);
  444 | 
  445 |     const bookings1 = response1.body as any[];
  446 |     const bookings2 = response2.body as any[];
  447 | 
  448 |     // Should return same bookings in same order
> 449 |     expect(bookings1.length).toBe(bookings2.length);
      |                              ^ Error: expect(received).toBe(expected) // Object.is equality
  450 |   });
  451 | });
  452 | 
```