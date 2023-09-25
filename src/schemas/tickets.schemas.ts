import Joi from 'joi';
import { TicketType } from '@/protocols';

export const ticketSchema = Joi.object<TicketType>({
  ticketTypeId: Joi.number().integer().required(),
});
