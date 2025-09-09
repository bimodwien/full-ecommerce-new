import { Request, Response, NextFunction } from 'express';
import CartService from '@/services/cart.service';

export class CartController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CartService.getAllCart(req);
      res.status(200).json({ message: 'Get carts success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CartService.createCart(req);
      res.status(201).json({ message: 'Cart created', cart: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CartService.updateCart(req);
      res.status(200).json({ message: 'Cart updated', cart: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CartService.deleteCart(req);
      res.status(200).json({ message: 'Cart deleted', cart: result });
    } catch (error) {
      next(error);
    }
  }
}
