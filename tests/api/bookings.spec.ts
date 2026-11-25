import { expect, test } from "@playwright/test";

interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: Date;
    checkout: Date;
  };
  additionalneeds: string;
}

// The API uses date strings.
type BookingPayload = Omit<Booking, "bookingdates"> & {
  bookingdates: {
    checkin: string;
    checkout: string;
  };
};

function toBookingPayload(booking: Booking): BookingPayload {
  return {
    ...booking,
    bookingdates: {
      // Format dates as YYYY-MM-DD.
      checkin: booking.bookingdates.checkin.toISOString().slice(0, 10),
      checkout: booking.bookingdates.checkout.toISOString().slice(0, 10),
    },
  };
}

test("can authenticate, create, update, and delete a booking", async ({
  request,
}) => {
  // The finally block uses these to remove the booking if a step fails.
  let token: string | undefined;
  let bookingId: number | undefined;

  try {
    const authResponse = await request.post("/auth", {
      data: { username: "admin", password: "password123" },
    });
    expect(authResponse.status()).toBe(200);

    const authBody = (await authResponse.json()) as { token?: string };
    const authToken = authBody.token;
    if (!authToken) {
      throw new Error("The auth response did not contain a token.");
    }
    token = authToken;

    const booking: Booking = {
      firstname: "Playwright",
      lastname: "Test",
      totalprice: 250,
      depositpaid: true,
      bookingdates: {
        checkin: new Date("2030-07-01"),
        checkout: new Date("2030-07-05"),
      },
      additionalneeds: "Breakfast",
    };
    const bookingPayload = toBookingPayload(booking);

    const createResponse = await request.post("/booking", {
      data: bookingPayload,
    });
    expect(createResponse.status()).toBe(200);

    const createdBooking = (await createResponse.json()) as {
      bookingid: number;
      booking: BookingPayload;
    };
    const id = createdBooking.bookingid;
    bookingId = id;
    expect(id).toBeGreaterThan(0);
    expect(createdBooking.booking).toEqual(bookingPayload);

    const updatedBooking: BookingPayload = {
      ...bookingPayload,
      firstname: "Updated",
      lastname: "User'",
      totalprice: 300,
      depositpaid: false,
      additionalneeds: "Lunch",
    };
    // Updates and deletes need the token cookie.
    const authHeaders = { Cookie: `token=${authToken}` };
    const updateResponse = await request.put(`/booking/${id}`, {
      data: updatedBooking,
      headers: authHeaders,
    });
    expect(updateResponse.status()).toBe(200);
    expect(await updateResponse.json()).toEqual(updatedBooking);

    const deleteResponse = await request.delete(`/booking/${id}`, {
      headers: authHeaders,
    });
    expect(deleteResponse.status()).toBe(201);
    bookingId = undefined;

    const deletedBookingResponse = await request.get(
      `/booking/${createdBooking.bookingid}`,
    );
    expect(deletedBookingResponse.status()).toBe(404);
  } finally {
    // Remove the booking if the test did not delete it.
    if (bookingId !== undefined) {
      if (!token) {
        throw new Error("Cannot clean up the booking without an auth token.");
      }

      const cleanupResponse = await request.delete(`/booking/${bookingId}`, {
        headers: { Cookie: `token=${token}` },
      });
      // 404 means it is already gone.
      expect([201, 404]).toContain(cleanupResponse.status());
    }
  }
});

test(
  "rejects invalid authentication credentials",
  { tag: "@negative" },
  async ({ request }) => {
    const response = await request.post("/auth", {
      data: { username: "invalid-user", password: "invalid-password" },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reason: "Bad credentials" });
  },
);

test(
  "returns not found for a non-existent booking",
  { tag: "@negative" },
  async ({ request }) => {
    const response = await request.get("/booking/999999999");

    expect(response.status()).toBe(404);
  },
);
