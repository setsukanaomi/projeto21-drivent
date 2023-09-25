import httpStatus from 'http-status';
import { Response } from 'express';
import { TicketType } from '@/protocols';
import { ticketServices } from '@/services/tickets-service';

import { AuthenticatedRequest } from '@/middlewares';

export async function getTicket(req: AuthenticatedRequest, res: Response) {
  const aTicketTypes = await ticketServices.getAllTicketTypes();

  return res.status(httpStatus.OK).send(aTicketTypes);
}

export async function getAllTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const ticketsTypes = await ticketServices.getAllTickets(userId);

  return res.status(httpStatus.OK).send(ticketsTypes);
}

export async function postTicket(req: AuthenticatedRequest, res: Response) {
  const { ticketTypeId } = req.body as TicketType;
  const { userId } = req;

  const aTicket = await ticketServices.postTicket(userId, ticketTypeId);

  return res.status(httpStatus.CREATED).send(aTicket);
}
