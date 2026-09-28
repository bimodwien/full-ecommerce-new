import { Request } from 'express';
import AppError from '@/libs/appError';

export function requireUserId(req: Request) {
  const userId = req.user?.id as string;
  if (!userId) throw new AppError('Unauthorized', 401);
  return userId;
}

// Id from the route param, falling back to the body for older clients.
export function requireId(req: Request, message: string) {
  const id = String(req.params.id || req.body.id || '');
  if (!id) throw new AppError(message, 400);
  return id;
}

export function parsePagination(req: Request) {
  const page = Math.max(1, Number(req.query.page || 1));
  let limit = Number(req.query.limit || 10);
  limit = Math.min(100, Math.max(1, limit));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageMeta(total: number, page: number, limit: number) {
  return { total, page, totalPages: Math.ceil(total / limit) || 1 };
}
