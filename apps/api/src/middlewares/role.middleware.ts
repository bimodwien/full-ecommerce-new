import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import AppError from '@/libs/appError';

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== 'seller') {
      const error = new AppError(
        'Unauthorized, only seller can access this API',
        403,
      );
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== 'buyer') {
      const error = new AppError(
        'Unauthorized, only buyer can access this API',
        403,
      );
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
};
