# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> Booking API - GetBooking @booking >> GET /booking/:id with special characters in ID @security
- Location: tests/bookings.spec.ts:274:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 200
Received array: [400, 404, 500]
```

# Test source

```ts
  177 | 
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
> 277 |     expect([400, 404, 500]).toContain(response.status);
      |                             ^ Error: expect(received).toContain(expected) // indexOf
  278 |   });
  279 | 
  280 |   test('GET /booking/:id with path traversal attempt @security', async ({ bookingClient }) => {
  281 |     const response = await bookingClient.getById('../../../etc/passwd');
  282 | 
  283 |     expect([400, 404, 500]).toContain(response.status);
  284 |   });
  285 | 
  286 |   test('GET /booking/:id with whitespace ID @edge-case', async ({ bookingClient }) => {
  287 |     const response = await bookingClient.getById('   ');
  288 | 
  289 |     expect([400, 404, 500]).toContain(response.status);
  290 |   });
  291 | 
  292 |   test('GET /booking/:id with empty string @edge-case', async ({ bookingClient }) => {
  293 |     const response = await bookingClient.getById('');
  294 | 
  295 |     expect([400, 404, 500]).toContain(response.status);
  296 |   });
  297 | 
  298 |   test('GET /booking/:id with decimal ID @edge-case', async ({ bookingClient }) => {
  299 |     const response = await bookingClient.getById('1.5');
  300 | 
  301 |     expect([400, 404, 500]).toContain(response.status);
  302 |   });
  303 | 
  304 |   test('GET /booking/:id with hexadecimal ID @edge-case', async ({ bookingClient }) => {
  305 |     const response = await bookingClient.getById('0x1A');
  306 | 
  307 |     expect([400, 404, 500]).toContain(response.status);
  308 |   });
  309 | 
  310 |   // ========================
  311 |   // NEGATIVE SCENARIOS: GET /booking (filters)
  312 |   // ========================
  313 | 
  314 |   test('GET /booking with non-existent firstname returns empty list @regression', async ({ bookingClient }) => {
  315 |     const response = await bookingClient.list({
  316 |       firstname: 'NonExistentFirstname12345',
  317 |     });
  318 | 
  319 |     assertStatus(response, 200);
  320 |     const bookings = response.body as any[];
  321 |     // Non-existent criteria should return empty or error
  322 |     expect([0, bookings.length]).toContain(bookings.length);
  323 |   });
  324 | 
  325 |   test('GET /booking with non-existent lastname returns empty list @regression', async ({ bookingClient }) => {
  326 |     const response = await bookingClient.list({
  327 |       lastname: 'NonExistentLastname12345',
  328 |     });
  329 | 
  330 |     assertStatus(response, 200);
  331 |     const bookings = response.body as any[];
  332 |     expect([0, bookings.length]).toContain(bookings.length);
  333 |   });
  334 | 
  335 |   test('GET /booking with invalid checkin date format @regression', async ({ bookingClient }) => {
  336 |     const response = await bookingClient.list({ checkin: 'invalid-date' });
  337 | 
  338 |     assertStatus(response, 200);
  339 |     // API should handle gracefully
  340 |     expect(Array.isArray(response.body)).toBe(true);
  341 |   });
  342 | 
  343 |   test('GET /booking with invalid checkout date format @regression', async ({ bookingClient }) => {
  344 |     const response = await bookingClient.list({ checkout: 'invalid-date' });
  345 | 
  346 |     assertStatus(response, 200);
  347 |     expect(Array.isArray(response.body)).toBe(true);
  348 |   });
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
```