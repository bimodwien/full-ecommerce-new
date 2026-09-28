import { Request, Response, NextFunction } from 'express';
import OrderCheckoutService from '@/services/order/checkout.service';
import OrderQueryService from '@/services/order/query.service';
import OrderPaymentService from '@/services/order/payment.service';
import OrderStatsService from '@/services/order/stats.service';
import OrderStatusService from '@/services/order/status.service';

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderCheckoutService.createOrder(req);
      res.status(201).json({ message: 'Order created', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderQueryService.getAllOrders(req);
      res.status(200).json({ message: 'Get orders success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderQueryService.getOrderById(req);
      res.status(200).json({ message: 'Get order success', order });
    } catch (error) {
      next(error);
    }
  }

  async retryPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderPaymentService.retryPayment(req);
      res.status(200).json({ message: 'Payment reinitialized', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderQueryService.getAllOrdersAdmin(req);
      res.status(200).json({ message: 'Get orders success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await OrderStatsService.getAdminStats(req);
      res.status(200).json({ message: 'Get order stats success', stats });
    } catch (error) {
      next(error);
    }
  }

  async ship(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderStatusService.shipOrder(req);
      res.status(200).json({ message: 'Order marked as shipped', order });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderStatusService.cancelOrder(req);
      res.status(200).json({ message: 'Order cancelled', order });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderStatusService.completeOrder(req);
      res.status(200).json({ message: 'Order completed', order });
    } catch (error) {
      next(error);
    }
  }

  async submitReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderStatusService.submitReturn(req);
      res.status(200).json({ message: 'Return submitted', order });
    } catch (error) {
      next(error);
    }
  }

  async notification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderPaymentService.handleNotification(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
