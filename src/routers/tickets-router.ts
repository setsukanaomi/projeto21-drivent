import { Router } from 'express';
import { getTicket, getAllTickets, postTicket } from '@/controllers/tickets-controller';
import { ticketSchema } from '@/schemas/tickets.schemas';
import { authenticateToken, validateBody } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicket)
  .get('/', getAllTickets)
  .post('/', validateBody(ticketSchema), postTicket);

export { ticketsRouter };
