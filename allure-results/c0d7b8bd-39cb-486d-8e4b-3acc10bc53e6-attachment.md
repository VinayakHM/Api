# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-create-update.spec.ts >> Booking API - CreateBooking & UpdateBooking @booking >> PUT /booking/:id with invalid booking ID format @regression
- Location: tests/booking-create-update.spec.ts:558:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 405
Received array: [400, 404, 500]
```

# Test source

```ts
  468 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  469 | 
  470 |     assertStatus(updateResponse, 200);
  471 |     const updated = (updateResponse.body as any);
  472 |     if (updated.depositpaid !== undefined) {
  473 |       expect(updated.depositpaid).toBe(true);
  474 |     }
  475 |   });
  476 | 
  477 |   test('PUT /booking/:id response contains updated booking @smoke', async ({ bookingClient, authClient }) => {
  478 |     const createPayload = buildNewBooking();
  479 |     const createResponse = await bookingClient.create(createPayload);
  480 |     const bookingId = (createResponse.body as any).bookingid;
  481 | 
  482 |     const tokenResponse = await authClient.createToken({
  483 |       username: 'admin',
  484 |       password: 'password123',
  485 |     });
  486 |     const token = (tokenResponse.body as any).token;
  487 | 
  488 |     const updatePayload = buildNewBooking({
  489 |       firstname: 'UpdatedName',
  490 |     });
  491 | 
  492 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  493 | 
  494 |     assertStatus(updateResponse, 200);
  495 |     const updated = (updateResponse.body as any);
  496 |     expect(updated.firstname).toBeDefined();
  497 |   });
  498 | 
  499 |   test('PUT /booking/:id response time is acceptable @performance', async ({ bookingClient, authClient }) => {
  500 |     const createPayload = buildNewBooking();
  501 |     const createResponse = await bookingClient.create(createPayload);
  502 |     const bookingId = (createResponse.body as any).bookingid;
  503 | 
  504 |     const tokenResponse = await authClient.createToken({
  505 |       username: 'admin',
  506 |       password: 'password123',
  507 |     });
  508 |     const token = (tokenResponse.body as any).token;
  509 | 
  510 |     const updatePayload = buildNewBooking();
  511 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  512 | 
  513 |     expect(updateResponse.durationMs).toBeLessThan(5000);
  514 |   });
  515 | 
  516 |   // ========================
  517 |   // NEGATIVE SCENARIOS: PUT /booking/:id (Update)
  518 |   // ========================
  519 | 
  520 |   test('PUT /booking/:id without token returns error @security', async ({ bookingClient }) => {
  521 |     const createPayload = buildNewBooking();
  522 |     const createResponse = await bookingClient.create(createPayload);
  523 |     const bookingId = (createResponse.body as any).bookingid;
  524 | 
  525 |     const updatePayload = buildNewBooking();
  526 |     const updateResponse = await bookingClient.update(bookingId, updatePayload);
  527 | 
  528 |     // Should require authentication
  529 |     expect([403, 401]).toContain(updateResponse.status);
  530 |   });
  531 | 
  532 |   test('PUT /booking/:id with invalid token returns error @security', async ({ bookingClient }) => {
  533 |     const createPayload = buildNewBooking();
  534 |     const createResponse = await bookingClient.create(createPayload);
  535 |     const bookingId = (createResponse.body as any).bookingid;
  536 | 
  537 |     const updatePayload = buildNewBooking();
  538 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, 'invalid_token_123');
  539 | 
  540 |     // Should reject invalid token
  541 |     expect([401, 403]).toContain(updateResponse.status);
  542 |   });
  543 | 
  544 |   test('PUT /booking/:id with non-existent booking ID returns error @regression', async ({ bookingClient, authClient }) => {
  545 |     const tokenResponse = await authClient.createToken({
  546 |       username: 'admin',
  547 |       password: 'password123',
  548 |     });
  549 |     const token = (tokenResponse.body as any).token;
  550 | 
  551 |     const updatePayload = buildNewBooking();
  552 |     const updateResponse = await bookingClient.update(999999, updatePayload, token);
  553 | 
  554 |     // Should return 404 or 500
  555 |     expect([404, 500]).toContain(updateResponse.status);
  556 |   });
  557 | 
  558 |   test('PUT /booking/:id with invalid booking ID format @regression', async ({ bookingClient, authClient }) => {
  559 |     const tokenResponse = await authClient.createToken({
  560 |       username: 'admin',
  561 |       password: 'password123',
  562 |     });
  563 |     const token = (tokenResponse.body as any).token;
  564 | 
  565 |     const updatePayload = buildNewBooking();
  566 |     const updateResponse = await bookingClient.update('abc', updatePayload, token);
  567 | 
> 568 |     expect([400, 404, 500]).toContain(updateResponse.status);
      |                             ^ Error: expect(received).toContain(expected) // indexOf
  569 |   });
  570 | 
  571 |   test('PUT /booking/:id with missing firstname @regression', async ({ bookingClient, authClient }) => {
  572 |     const createPayload = buildNewBooking();
  573 |     const createResponse = await bookingClient.create(createPayload);
  574 |     const bookingId = (createResponse.body as any).bookingid;
  575 | 
  576 |     const tokenResponse = await authClient.createToken({
  577 |       username: 'admin',
  578 |       password: 'password123',
  579 |     });
  580 |     const token = (tokenResponse.body as any).token;
  581 | 
  582 |     const updatePayload = buildNewBooking({ firstname: '' });
  583 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  584 | 
  585 |     expect([200, 400]).toContain(updateResponse.status);
  586 |   });
  587 | 
  588 |   test('PUT /booking/:id with invalid totalprice @regression', async ({ bookingClient, authClient }) => {
  589 |     const createPayload = buildNewBooking();
  590 |     const createResponse = await bookingClient.create(createPayload);
  591 |     const bookingId = (createResponse.body as any).bookingid;
  592 | 
  593 |     const tokenResponse = await authClient.createToken({
  594 |       username: 'admin',
  595 |       password: 'password123',
  596 |     });
  597 |     const token = (tokenResponse.body as any).token;
  598 | 
  599 |     const updatePayload = buildNewBooking();
  600 |     (updatePayload as any).totalprice = 'invalid';
  601 | 
  602 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  603 | 
  604 |     expect([200, 400, 500]).toContain(updateResponse.status);
  605 |   });
  606 | 
  607 |   test('PUT /booking/:id with invalid checkin date @regression', async ({ bookingClient, authClient }) => {
  608 |     const createPayload = buildNewBooking();
  609 |     const createResponse = await bookingClient.create(createPayload);
  610 |     const bookingId = (createResponse.body as any).bookingid;
  611 | 
  612 |     const tokenResponse = await authClient.createToken({
  613 |       username: 'admin',
  614 |       password: 'password123',
  615 |     });
  616 |     const token = (tokenResponse.body as any).token;
  617 | 
  618 |     const updatePayload = buildNewBooking();
  619 |     updatePayload.bookingdates.checkin = 'invalid';
  620 | 
  621 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  622 | 
  623 |     expect([200, 400, 500]).toContain(updateResponse.status);
  624 |   });
  625 | 
  626 |   test('PUT /booking/:id with SQL injection in firstname @security', async ({ bookingClient, authClient }) => {
  627 |     const createPayload = buildNewBooking();
  628 |     const createResponse = await bookingClient.create(createPayload);
  629 |     const bookingId = (createResponse.body as any).bookingid;
  630 | 
  631 |     const tokenResponse = await authClient.createToken({
  632 |       username: 'admin',
  633 |       password: 'password123',
  634 |     });
  635 |     const token = (tokenResponse.body as any).token;
  636 | 
  637 |     const updatePayload = buildNewBooking({
  638 |       firstname: "'; DROP TABLE bookings; --",
  639 |     });
  640 | 
  641 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  642 | 
  643 |     // Should safely handle injection
  644 |     expect([200, 400]).toContain(updateResponse.status);
  645 | 
  646 |     if (updateResponse.status === 200) {
  647 |       // Booking should still exist
  648 |       const getResponse = await bookingClient.getById(bookingId);
  649 |       expect(getResponse.status).toBe(200);
  650 |     }
  651 |   });
  652 | 
  653 |   test('PUT /booking/:id with very long firstname @edge-case', async ({ bookingClient, authClient }) => {
  654 |     const createPayload = buildNewBooking();
  655 |     const createResponse = await bookingClient.create(createPayload);
  656 |     const bookingId = (createResponse.body as any).bookingid;
  657 | 
  658 |     const tokenResponse = await authClient.createToken({
  659 |       username: 'admin',
  660 |       password: 'password123',
  661 |     });
  662 |     const token = (tokenResponse.body as any).token;
  663 | 
  664 |     const updatePayload = buildNewBooking({
  665 |       firstname: 'a'.repeat(1000),
  666 |     });
  667 | 
  668 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
```