# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-create-update.spec.ts >> Booking API - CreateBooking & UpdateBooking @booking >> PUT /booking/:id with zero ID @edge-case
- Location: tests/booking-create-update.spec.ts:673:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 405
Received array: [400, 404, 500]
```

# Test source

```ts
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
  669 | 
  670 |     expect([200, 400, 413, 414]).toContain(updateResponse.status);
  671 |   });
  672 | 
  673 |   test('PUT /booking/:id with zero ID @edge-case', async ({ bookingClient, authClient }) => {
  674 |     const tokenResponse = await authClient.createToken({
  675 |       username: 'admin',
  676 |       password: 'password123',
  677 |     });
  678 |     const token = (tokenResponse.body as any).token;
  679 | 
  680 |     const updatePayload = buildNewBooking();
  681 |     const updateResponse = await bookingClient.update(0, updatePayload, token);
  682 | 
> 683 |     expect([400, 404, 500]).toContain(updateResponse.status);
      |                             ^ Error: expect(received).toContain(expected) // indexOf
  684 |   });
  685 | 
  686 |   test('PUT /booking/:id with negative ID @edge-case', async ({ bookingClient, authClient }) => {
  687 |     const tokenResponse = await authClient.createToken({
  688 |       username: 'admin',
  689 |       password: 'password123',
  690 |     });
  691 |     const token = (tokenResponse.body as any).token;
  692 | 
  693 |     const updatePayload = buildNewBooking();
  694 |     const updateResponse = await bookingClient.update(-1, updatePayload, token);
  695 | 
  696 |     expect([400, 404, 500]).toContain(updateResponse.status);
  697 |   });
  698 | 
  699 |   test('PUT /booking/:id has proper Content-Type header in response @smoke', async ({ bookingClient, authClient }) => {
  700 |     const createPayload = buildNewBooking();
  701 |     const createResponse = await bookingClient.create(createPayload);
  702 |     const bookingId = (createResponse.body as any).bookingid;
  703 | 
  704 |     const tokenResponse = await authClient.createToken({
  705 |       username: 'admin',
  706 |       password: 'password123',
  707 |     });
  708 |     const token = (tokenResponse.body as any).token;
  709 | 
  710 |     const updatePayload = buildNewBooking();
  711 |     const updateResponse = await bookingClient.update(bookingId, updatePayload, token);
  712 | 
  713 |     if (updateResponse.status === 200) {
  714 |       expect(updateResponse.headers['content-type']).toMatch(/application\/json/);
  715 |     }
  716 |   });
  717 | });
  718 | 
```