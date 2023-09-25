import { Enrollment, Ticket, TicketType } from '@prisma/client';
import { prisma } from '@/config';

async function findManyTickets(): Promise<TicketType[]> {
  const types = await prisma.ticketType.findMany();
  return types as TicketType[];
}

async function findFirstTicket(userId: number): Promise<TicketResponse | null> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      Enrollment: { userId },
    },
    include: {
      TicketType: true,
    },
  });
  return ticket as TicketResponse;
}

async function findTicketEnrollment(userId: number): Promise<Enrollment> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId },
  });
  return enrollment as Enrollment;
}

async function findATicketType(id: number): Promise<TicketType> {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id },
  });
  return ticketType as TicketType;
}

async function createTicket(data: CreateTicket) {
  const createdTicket = await prisma.ticket.create({
    data: data,
  });
  const ticketType = await findATicketType(data.ticketTypeId);

  const response = {
    ...createdTicket,
    TicketType: ticketType,
  };
  return response as TicketResponse;
}

export const ticketsRepository = {
  findManyTickets,
  findFirstTicket,
  createTicket,
  findTicketEnrollment,
  findATicketType,
};

export type TicketResponse = Ticket & {
  TicketType: TicketType;
};

export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;
