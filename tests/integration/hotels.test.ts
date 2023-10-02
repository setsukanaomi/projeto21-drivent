import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { createEnrollmentWithAddress, createHotels, createTicket, createTicketTypeA, createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given invalid token', async () => {
    const invalidToken = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for the provided token', async () => {
    const userWithoutSession = await createUser();
    const tokenWithoutSession = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${tokenWithoutSession}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when there are no enrollments registered', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there are no tickets registered', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there are no hotels registered', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should respond with status 402 when the ticket is not paid', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createHotels();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when the ticket is remote', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when the ticket does not include a hotel', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 200 and with existing hotels data', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels('name1', 'image1');

      const response = await server.get('/hotels').set('Authorization', `Bearer ${validToken}`);
      const hotelWithRooms = response.body;

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(expect.arrayContaining(hotelWithRooms));
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given invalid token', async () => {
    const invalidToken = faker.lorem.word();

    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for the provided token', async () => {
    const userWithoutSession = await createUser();
    const tokenWithoutSession = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server
      .get(`/hotels/1/${userWithoutSession.id}`)
      .set('Authorization', `Bearer ${tokenWithoutSession}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when there are no enrollments registered', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there are no tickets registered', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there are no hotels registered', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should respond with status 402 when the ticket is not paid', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createHotels();

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when the ticket is remote', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when the ticket does not include a hotel', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 400 when the hotelId is not a number', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const response = await server.get('/hotels/true').set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when there is no hotel with the specified id', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const response = await server.get(`/hotels/2325`).set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and with existing hotel and room data', async () => {
      const user = await createUser();
      const validToken = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeA(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${validToken}`);
      const hotelWithRooms = response.body;

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(hotelWithRooms);
    });
  });
});
