import { Enrollment, TicketStatus, TicketType } from '@prisma/client';
import { notFoundError } from '@/errors';
import { TicketResponse, ticketsRepository } from '@/repositories/tickets-repository';

async function getAllTicketTypes(): Promise<TicketType[]> {
  const AllTickets = await ticketsRepository.findManyTickets();
  return AllTickets;
}

async function getAllTickets(id: number): Promise<TicketResponse> {
  const aticket = await ticketsRepository.findFirstTicket(id);

  if (!aticket) throw notFoundError();

  return aticket;
}

async function postTicket(userId: number, ticketTypeId: number): Promise<TicketResponse> {
  const enrollmentTicket: Enrollment = await ticketsRepository.findTicketEnrollment(userId);

  if (!enrollmentTicket) throw notFoundError();

  const dataTicket = {
    status: TicketStatus.RESERVED,
    ticketTypeId: ticketTypeId,
    enrollmentId: enrollmentTicket.id,
  };

  const aTicket = await ticketsRepository.createTicket(dataTicket);

  if (!aTicket) throw notFoundError();

  return aTicket;
}

export const ticketServices = {
  getAllTicketTypes,
  getAllTickets,
  postTicket,
};
