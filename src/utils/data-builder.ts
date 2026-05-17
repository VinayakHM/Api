import { faker } from "@faker-js/faker";
import { NewUser } from "../schemas/user.schema";
import { NewPost } from "../schemas/post.schema";
import { Booking } from "../schemas/booking.schema";

export function buildNewUser(overrides: Partial<NewUser>): NewUser {
  return {
    name: faker.person.fullName(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    website: faker.internet.domainName(),
    address: {
      street: faker.location.street(),
      suite: `Apt. ${faker.number.int({ min: 1, max: 999 })}`,
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      geo: {
        lat: faker.location.latitude.toString(),
        lng: faker.location.longitude.toString(),
      },
    },
    company: {
      name: faker.company.name(),
      catchPhrase: faker.company.catchPhrase(),
      bs: faker.company.buzzPhrase(),
    },
    ...overrides,
  };
}

export function buildNewPost(overrides: Partial<NewPost> = {}): NewPost {
  return {
    userId: faker.number.int({ min: 1, max: 10 }),
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    ...overrides,
  };
}

export function buildNewBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.future();
  const checkout = faker.date.future({ refDate: checkin });

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 0, max: 5000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0],
    },
    additionalneeds: faker.lorem.words(2),
    ...overrides,
  };
}
