# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-create-update.spec.ts >> Booking API - CreateBooking & UpdateBooking @booking >> POST /booking with invalid checkout date format @regression
- Location: tests/booking-create-update.spec.ts:266:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 200
Received array: [400, 500]
```

# Test source

```ts
  172 |   });
  173 | 
  174 |   test('POST /booking response contains correct response structure @smoke', async ({ bookingClient }) => {
  175 |     const payload = buildNewBooking();
  176 |     const response = await bookingClient.create(payload);
  177 | 
  178 |     assertStatus(response, 200);
  179 |     const result = response.body as any;
  180 | 
  181 |     expect(Object.keys(result)).toContain('bookingid');
  182 |     expect(Object.keys(result)).toContain('booking');
  183 |   });
  184 | 
  185 |   // ========================
  186 |   // NEGATIVE SCENARIOS: POST /booking (Create)
  187 |   // ========================
  188 | 
  189 |   test('POST /booking with missing firstname returns error @regression', async ({ bookingClient }) => {
  190 |     const payload = buildNewBooking({ firstname: '' });
  191 |     const response = await bookingClient.create(payload);
  192 | 
  193 |     // API may accept empty string or return error
  194 |     expect([200, 400]).toContain(response.status);
  195 |   });
  196 | 
  197 |   test('POST /booking with missing lastname returns error @regression', async ({ bookingClient }) => {
  198 |     const payload = buildNewBooking({ lastname: '' });
  199 |     const response = await bookingClient.create(payload);
  200 | 
  201 |     expect([200, 400]).toContain(response.status);
  202 |   });
  203 | 
  204 |   test('POST /booking with missing totalprice returns error @regression', async ({ bookingClient }) => {
  205 |     const payload = buildNewBooking();
  206 |     delete (payload as any).totalprice;
  207 | 
  208 |     const response = await bookingClient.create(payload);
  209 | 
  210 |     expect([200, 400, 500]).toContain(response.status);
  211 |   });
  212 | 
  213 |   test('POST /booking with missing depositpaid returns error @regression', async ({ bookingClient }) => {
  214 |     const payload = buildNewBooking();
  215 |     delete (payload as any).depositpaid;
  216 | 
  217 |     const response = await bookingClient.create(payload);
  218 | 
  219 |     expect([200, 400, 500]).toContain(response.status);
  220 |   });
  221 | 
  222 |   test('POST /booking with missing bookingdates returns error @regression', async ({ bookingClient }) => {
  223 |     const payload = buildNewBooking();
  224 |     delete (payload as any).bookingdates;
  225 | 
  226 |     const response = await bookingClient.create(payload);
  227 | 
  228 |     expect([200, 400, 500]).toContain(response.status);
  229 |   });
  230 | 
  231 |   test('POST /booking with invalid totalprice (negative) @regression', async ({ bookingClient }) => {
  232 |     const payload = buildNewBooking({ totalprice: -100 });
  233 |     const response = await bookingClient.create(payload);
  234 | 
  235 |     // API may accept or reject negative prices
  236 |     expect([200, 400]).toContain(response.status);
  237 |   });
  238 | 
  239 |   test('POST /booking with invalid totalprice (string) @regression', async ({ bookingClient }) => {
  240 |     const payload = buildNewBooking();
  241 |     (payload as any).totalprice = 'not a number';
  242 | 
  243 |     const response = await bookingClient.create(payload);
  244 | 
  245 |     expect([400, 500]).toContain(response.status);
  246 |   });
  247 | 
  248 |   test('POST /booking with invalid depositpaid (non-boolean) @regression', async ({ bookingClient }) => {
  249 |     const payload = buildNewBooking();
  250 |     (payload as any).depositpaid = 'yes';
  251 | 
  252 |     const response = await bookingClient.create(payload);
  253 | 
  254 |     expect([200, 400, 500]).toContain(response.status);
  255 |   });
  256 | 
  257 |   test('POST /booking with invalid checkin date format @regression', async ({ bookingClient }) => {
  258 |     const payload = buildNewBooking();
  259 |     payload.bookingdates.checkin = 'invalid-date';
  260 | 
  261 |     const response = await bookingClient.create(payload);
  262 | 
  263 |     expect([400, 500]).toContain(response.status);
  264 |   });
  265 | 
  266 |   test('POST /booking with invalid checkout date format @regression', async ({ bookingClient }) => {
  267 |     const payload = buildNewBooking();
  268 |     payload.bookingdates.checkout = '01/01/2024';
  269 | 
  270 |     const response = await bookingClient.create(payload);
  271 | 
> 272 |     expect([400, 500]).toContain(response.status);
      |                        ^ Error: expect(received).toContain(expected) // indexOf
  273 |   });
  274 | 
  275 |   test('POST /booking with checkout before checkin @regression', async ({ bookingClient }) => {
  276 |     const payload = buildNewBooking({
  277 |       bookingdates: {
  278 |         checkin: '2024-01-15',
  279 |         checkout: '2024-01-01',
  280 |       },
  281 |     });
  282 | 
  283 |     const response = await bookingClient.create(payload);
  284 | 
  285 |     // API may accept or reject reversed dates
  286 |     expect([200, 400]).toContain(response.status);
  287 |   });
  288 | 
  289 |   test('POST /booking with very long firstname @edge-case', async ({ bookingClient }) => {
  290 |     const payload = buildNewBooking({
  291 |       firstname: 'a'.repeat(1000),
  292 |     });
  293 | 
  294 |     const response = await bookingClient.create(payload);
  295 | 
  296 |     expect([200, 400, 413, 414]).toContain(response.status);
  297 |   });
  298 | 
  299 |   test('POST /booking with very long lastname @edge-case', async ({ bookingClient }) => {
  300 |     const payload = buildNewBooking({
  301 |       lastname: 'b'.repeat(1000),
  302 |     });
  303 | 
  304 |     const response = await bookingClient.create(payload);
  305 | 
  306 |     expect([200, 400, 413, 414]).toContain(response.status);
  307 |   });
  308 | 
  309 |   test('POST /booking with unicode characters in firstname @edge-case', async ({ bookingClient }) => {
  310 |     const payload = buildNewBooking({
  311 |       firstname: '日本',
  312 |     });
  313 | 
  314 |     const response = await bookingClient.create(payload);
  315 | 
  316 |     expect([200, 400]).toContain(response.status);
  317 |   });
  318 | 
  319 |   test('POST /booking with SQL injection in firstname @security', async ({ bookingClient }) => {
  320 |     const payload = buildNewBooking({
  321 |       firstname: "'; DROP TABLE bookings; --",
  322 |     });
  323 | 
  324 |     const response = await bookingClient.create(payload);
  325 | 
  326 |     // Should safely handle injection attempt
  327 |     expect([200, 400]).toContain(response.status);
  328 | 
  329 |     if (response.status === 200) {
  330 |       const result = response.body as any;
  331 |       // Table should still exist (not dropped)
  332 |       expect(result.bookingid).toBeGreaterThan(0);
  333 |     }
  334 |   });
  335 | 
  336 |   test('POST /booking with very large totalprice @edge-case', async ({ bookingClient }) => {
  337 |     const payload = buildNewBooking({
  338 |       totalprice: Number.MAX_SAFE_INTEGER,
  339 |     });
  340 | 
  341 |     const response = await bookingClient.create(payload);
  342 | 
  343 |     expect([200, 400]).toContain(response.status);
  344 |   });
  345 | 
  346 |   test('POST /booking with float totalprice @regression', async ({ bookingClient }) => {
  347 |     const payload = buildNewBooking({ totalprice: 99.99 });
  348 |     const response = await bookingClient.create(payload);
  349 | 
  350 |     // API may accept or convert float prices
  351 |     expect([200, 400]).toContain(response.status);
  352 |   });
  353 | 
  354 |   test('POST /booking with null firstname @regression', async ({ bookingClient }) => {
  355 |     const payload = buildNewBooking();
  356 |     (payload as any).firstname = null;
  357 | 
  358 |     const response = await bookingClient.create(payload);
  359 | 
  360 |     expect([200, 400, 500]).toContain(response.status);
  361 |   });
  362 | 
  363 |   test('POST /booking with empty additionalneeds @regression', async ({ bookingClient }) => {
  364 |     const payload = buildNewBooking({ additionalneeds: '' });
  365 |     const response = await bookingClient.create(payload);
  366 | 
  367 |     // Empty additionalneeds should be acceptable
  368 |     expect([200, 400]).toContain(response.status);
  369 |   });
  370 | 
  371 |   test('POST /booking with very long additionalneeds @edge-case', async ({ bookingClient }) => {
  372 |     const payload = buildNewBooking({
```