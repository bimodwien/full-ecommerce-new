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

  async getAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.getAllOrdersAdmin(req);
      res.status(200).json({ message: 'Get orders success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async ship(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.shipOrder(req);
      res.status(200).json({ message: 'Order marked as shipped', order });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.cancelOrder(req);
      res.status(200).json({ message: 'Order cancelled', order });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.completeOrder(req);
      res.status(200).json({ message: 'Order completed', order });
    } catch (error) {
      next(error);
    }
  }

  async submitReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.submitReturn(req);
      res.status(200).json({ message: 'Return submitted', order });
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
