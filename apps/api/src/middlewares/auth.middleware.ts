import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { TDecode } from '@/models/user.model';
import { SECRET_KEY } from '@/config';

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  if (!token) {
    return next(new Error('Access denied. No token provided.'));
  }
  try {
    const decoded = verify(token, SECRET_KEY) as TDecode;
    if (decoded.type !== 'access_token') throw new Error('Invalid token type');
    req.user = decoded.user;
    next();
  } catch (error) {
    next();
  }
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  if (!token) {
    return next(new Error('Access denied. No token provided.'));
  }
  try {
    const decoded = verify(token, SECRET_KEY) as TDecode;
    if (decoded.type !== 'refresh_token') throw new Error('Invalid token type');
    req.user = decoded.user;
    next();
  } catch (error) {
    next();
  }
};
