import { Request, Response, NextFunction } from 'express';
import OrderService from '@/services/order.service';

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.createOrder(req);
      res.status(201).json({ message: 'Order created', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.getAllOrders(req);
      res.status(200).json({ message: 'Get orders success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(req);
      res.status(200).json({ message: 'Get order success', order });
    } catch (error) {
      next(error);
    }
  }

  async retryPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.retryPayment(req);
      res.status(200).json({ message: 'Payment reinitialized', ...result });
    } catch (error) {
      next(error);
    }
  }

  async notification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.handleNotification(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
