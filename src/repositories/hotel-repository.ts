import { Hotel } from '@prisma/client';
import { prisma } from '@/config';

async function findAllHotelsMany(): Promise<{ hotels: Hotel[]; count: number }> {
  const resultHotels = await prisma.hotel.findMany();
  const countMany = await prisma.hotel.count();
  return { hotels: resultHotels, countMany };
}

async function findHotelByIdOne(id: number) {
  const resultHotel = await prisma.hotel.findUnique({
    where: { id },
    include: { Rooms: true },
  });
  return resultHotel;
}

export const hotelsRepository = {
  findAllHotelsMany,
  findHotelByIdOne,
};
