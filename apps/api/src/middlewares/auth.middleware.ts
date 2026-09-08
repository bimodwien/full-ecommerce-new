import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { TDecode } from '@/models/user.model';
import { SECRET_KEY } from '@/config';
import AppError from '@/libs/appError';

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }
  try {
    const decoded = verify(token, SECRET_KEY) as TDecode;
    if (decoded.type !== 'access_token') throw new Error('Invalid token type');
    req.user = decoded.user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token.', 401));
  }
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }
  try {
    const decoded = verify(token, SECRET_KEY) as TDecode;
    if (decoded.type !== 'refresh_token') throw new Error('Invalid token type');
    req.user = decoded.user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired refresh token.', 401));
  }
};
