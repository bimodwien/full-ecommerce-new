import { Request, Response, NextFunction } from 'express';
import WishlistService from '@/services/wishlist.service';

export class WishlistController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.getAllWishlist(req);
      res.status(200).json({ message: 'Get wishlists success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.createWishlist(req);
      res.status(201).json({ message: 'Wishlist created', wishlist: result });
    } catch (error) {
      next(error);
    }
  }

  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.toggleWishlist(req);
      res.status(200).json({ message: 'Toggle wishlist success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.deleteWishlist(req);
      res.status(200).json({ message: 'Wishlist deleted', wishlist: result });
    } catch (error) {
      next(error);
    }
  }
}
