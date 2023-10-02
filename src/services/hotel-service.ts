import { invalidDataError, notFoundError, paymentErrors } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { hotelsRepository } from '@/repositories/hotel-repository';

async function findHotelsMany(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticketOne = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const hotelsInfo = await hotelsRepository.findAllHotelsMany();

  if (!ticketOne) throw notFoundError();

  if (ticketOne.status === 'RESERVED' || ticketOne.TicketType.isRemote || !ticketOne.TicketType.includesHotel)
    throw paymentErrors();

  if (hotelsInfo.count === 0) throw notFoundError();

  return hotelsInfo.hotels;
}

async function findHotelOne(userId: number, id: string) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const hotelId = Number(id);
  if (!enrollment) throw notFoundError();
  if (isNaN(hotelId)) throw invalidDataError('hotelId must be a number');

  const ticketOne = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const hotelOne = await hotelsRepository.findHotelByIdOne(hotelId);

  if (!ticketOne) throw notFoundError();

  if (ticketOne.status === 'RESERVED' || ticketOne.TicketType.isRemote || !ticketOne.TicketType.includesHotel)
    throw paymentErrors();

  if (!hotelOne) throw notFoundError();

  return hotelOne;
}

export const hotelService = {
  findHotelsMany,
  findHotelOne,
};
