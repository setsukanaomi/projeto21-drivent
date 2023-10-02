import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelService } from '@/services/hotel-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelsMany = await hotelService.findHotelsMany(userId);
  res.status(httpStatus.OK).send(hotelsMany);
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;
  const hotelOne = await hotelService.findHotelOne(userId, hotelId);
  res.status(httpStatus.OK).send(hotelOne);
}
