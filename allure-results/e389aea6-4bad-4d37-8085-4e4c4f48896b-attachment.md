# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> Booking API - GetBooking @booking >> GET /booking/:id with special characters in ID @security
- Location: tests/bookings.spec.ts:274:7

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 400
Received:    200
```

# Test source

```ts
  178 |     expect(response.durationMs).toBeLessThan(5000);
  179 |   });
  180 | 
  181 |   // ========================
  182 |   // POSITIVE SCENARIOS: GET /booking with filters
  183 |   // ========================
  184 | 
  185 |   test('GET /booking with firstname filter @regression', async ({ bookingClient }) => {
  186 |     // First, get a known booking to extract firstname
  187 |     const bookingResponse = await bookingClient.getById(1);
  188 |     assertStatus(bookingResponse, 200);
  189 |     const knownFirstname = (bookingResponse.body as any).firstname;
  190 | 
  191 |     // Now filter by that firstname
  192 |     const response = await bookingClient.list({ firstname: knownFirstname });
  193 | 
  194 |     assertStatus(response, 200);
  195 |     const bookings = response.body as any[];
  196 |     expect(bookings.length).toBeGreaterThanOrEqual(0);
  197 |   });
  198 | 
  199 |   test('GET /booking with lastname filter @regression', async ({ bookingClient }) => {
  200 |     // First, get a known booking to extract lastname
  201 |     const bookingResponse = await bookingClient.getById(1);
  202 |     assertStatus(bookingResponse, 200);
  203 |     const knownLastname = (bookingResponse.body as any).lastname;
  204 | 
  205 |     // Now filter by that lastname
  206 |     const response = await bookingClient.list({ lastname: knownLastname });
  207 | 
  208 |     assertStatus(response, 200);
  209 |     const bookings = response.body as any[];
  210 |     expect(bookings.length).toBeGreaterThanOrEqual(0);
  211 |   });
  212 | 
  213 |   test('GET /booking with checkin date filter @regression', async ({ bookingClient }) => {
  214 |     const response = await bookingClient.list({ checkin: '2013-02-23' });
  215 | 
  216 |     assertStatus(response, 200);
  217 |     const bookings = response.body as any[];
  218 |     expect(Array.isArray(bookings)).toBe(true);
  219 |   });
  220 | 
  221 |   test('GET /booking with checkout date filter @regression', async ({ bookingClient }) => {
  222 |     const response = await bookingClient.list({ checkout: '2014-10-23' });
  223 | 
  224 |     assertStatus(response, 200);
  225 |     const bookings = response.body as any[];
  226 |     expect(Array.isArray(bookings)).toBe(true);
  227 |   });
  228 | 
  229 |   test('GET /booking with multiple filters @regression', async ({ bookingClient }) => {
  230 |     const response = await bookingClient.list({
  231 |       firstname: 'John',
  232 |       lastname: 'Doe',
  233 |     });
  234 | 
  235 |     assertStatus(response, 200);
  236 |     const bookings = response.body as any[];
  237 |     expect(Array.isArray(bookings)).toBe(true);
  238 |   });
  239 | 
  240 |   // ========================
  241 |   // NEGATIVE SCENARIOS: GET /booking/:id
  242 |   // ========================
  243 | 
  244 |   test('GET /booking/:id with non-existent ID returns 404 @regression', async ({ bookingClient }) => {
  245 |     const response = await bookingClient.getById(999999);
  246 | 
  247 |     expect([404, 500]).toContain(response.status);
  248 |   });
  249 | 
  250 |   test('GET /booking/:id with ID 0 @edge-case', async ({ bookingClient }) => {
  251 |     const response = await bookingClient.getById(0);
  252 | 
  253 |     expect([400, 404, 500]).toContain(response.status);
  254 |   });
  255 | 
  256 |   test('GET /booking/:id with negative ID @edge-case', async ({ bookingClient }) => {
  257 |     const response = await bookingClient.getById(-1);
  258 | 
  259 |     expect([400, 404, 500]).toContain(response.status);
  260 |   });
  261 | 
  262 |   test('GET /booking/:id with extremely large ID @edge-case', async ({ bookingClient }) => {
  263 |     const response = await bookingClient.getById(999999999999);
  264 | 
  265 |     expect([400, 404, 500]).toContain(response.status);
  266 |   });
  267 | 
  268 |   test('GET /booking/:id with non-numeric ID returns error @regression', async ({ bookingClient }) => {
  269 |     const response = await bookingClient.getById('abc');
  270 | 
  271 |     expect([400, 404, 500]).toContain(response.status);
  272 |   });
  273 | 
  274 |   test('GET /booking/:id with special characters in ID @security', async ({ bookingClient }) => {
  275 |     const response = await bookingClient.getById("1'; DROP TABLE bookings; --");
  276 | 
  277 |     // API may return 404 or 500 for invalid ID
> 278 |     expect(response.status).toBeGreaterThanOrEqual(400);
      |                             ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  279 |   });
  280 | 
  281 |   test('GET /booking/:id with path traversal attempt @security', async ({ bookingClient }) => {
  282 |     const response = await bookingClient.getById('../../../etc/passwd');
  283 | 
  284 |     expect([400, 404, 500]).toContain(response.status);
  285 |   });
  286 | 
  287 |   test('GET /booking/:id with whitespace ID @edge-case', async ({ bookingClient }) => {
  288 |     const response = await bookingClient.getById('   ');
  289 | 
  290 |     // Whitespace IDs should not be found or cause error
  291 |     expect([200, 400, 404, 500]).toContain(response.status);
  292 |   });
  293 | 
  294 |   test('GET /booking/:id with empty string @edge-case', async ({ bookingClient }) => {
  295 |     const response = await bookingClient.getById('');
  296 | 
  297 |     // Empty string should not be a valid ID
  298 |     expect([200, 400, 404, 500]).toContain(response.status);
  299 |   });
  300 | 
  301 |   test('GET /booking/:id with decimal ID @edge-case', async ({ bookingClient }) => {
  302 |     const response = await bookingClient.getById('1.5');
  303 | 
  304 |     // Decimal IDs may be treated as invalid or converted
  305 |     expect([200, 400, 404, 500]).toContain(response.status);
  306 |   });
  307 | 
  308 |   test('GET /booking/:id with hexadecimal ID @edge-case', async ({ bookingClient }) => {
  309 |     const response = await bookingClient.getById('0x1A');
  310 | 
  311 |     // Hex string IDs should not be found or should error
  312 |     expect([200, 400, 404, 500]).toContain(response.status);
  313 |   });
  314 | 
  315 |   // ========================
  316 |   // NEGATIVE SCENARIOS: GET /booking (filters)
  317 |   // ========================
  318 | 
  319 |   test('GET /booking with non-existent firstname returns empty list @regression', async ({ bookingClient }) => {
  320 |     const response = await bookingClient.list({
  321 |       firstname: 'NonExistentFirstname12345',
  322 |     });
  323 | 
  324 |     assertStatus(response, 200);
  325 |     const bookings = response.body as any[];
  326 |     // Non-existent criteria should return empty or error
  327 |     expect([0, bookings.length]).toContain(bookings.length);
  328 |   });
  329 | 
  330 |   test('GET /booking with non-existent lastname returns empty list @regression', async ({ bookingClient }) => {
  331 |     const response = await bookingClient.list({
  332 |       lastname: 'NonExistentLastname12345',
  333 |     });
  334 | 
  335 |     assertStatus(response, 200);
  336 |     const bookings = response.body as any[];
  337 |     expect([0, bookings.length]).toContain(bookings.length);
  338 |   });
  339 | 
  340 |   test('GET /booking with invalid checkin date format @regression', async ({ bookingClient }) => {
  341 |     const response = await bookingClient.list({ checkin: 'invalid-date' });
  342 | 
  343 |     // API may return 200 with filtered results or 400 for invalid format
  344 |     expect([200, 400]).toContain(response.status);
  345 |     if (response.status === 200) {
  346 |       expect(Array.isArray(response.body)).toBe(true);
  347 |     }
  348 |   });
  349 | 
  350 |   test('GET /booking with invalid checkout date format @regression', async ({ bookingClient }) => {
  351 |     const response = await bookingClient.list({ checkout: 'invalid-date' });
  352 | 
  353 |     // API may return 200 with filtered results or 400 for invalid format
  354 |     expect([200, 400]).toContain(response.status);
  355 |     if (response.status === 200) {
  356 |       expect(Array.isArray(response.body)).toBe(true);
  357 |     }
  358 |   });
  359 | 
  360 |   test('GET /booking with SQL injection in firstname filter @security', async ({ bookingClient }) => {
  361 |     const response = await bookingClient.list({
  362 |       firstname: "'; DROP TABLE bookings; --",
  363 |     });
  364 | 
  365 |     assertStatus(response, 200);
  366 |     // API should safely handle injection attempt
  367 |     const bookings = response.body as any[];
  368 |     expect(Array.isArray(bookings)).toBe(true);
  369 |   });
  370 | 
  371 |   test('GET /booking with SQL injection in lastname filter @security', async ({ bookingClient }) => {
  372 |     const response = await bookingClient.list({
  373 |       lastname: "' OR '1'='1",
  374 |     });
  375 | 
  376 |     assertStatus(response, 200);
  377 |     const bookings = response.body as any[];
  378 |     expect(Array.isArray(bookings)).toBe(true);
```