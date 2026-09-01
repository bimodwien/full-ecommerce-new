import { Router } from 'express';
import { validateToken } from '@/middlewares/auth.middleware';
import { verifyUser } from '@/middlewares/role.middleware';
import { OrderController } from '@/controllers/order.controller';

export class OrderRouter {
  private router = Router();
  private controller = new OrderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/',
      validateToken,
      verifyUser,
      this.controller.create.bind(this.controller),
    );
    this.router.get(
      '/',
      validateToken,
      verifyUser,
      this.controller.getAll.bind(this.controller),
    );
    this.router.get(
      '/:id',
      validateToken,
      verifyUser,
      this.controller.getOne.bind(this.controller),
    );
    this.router.post(
      '/:id/retry-payment',
      validateToken,
      verifyUser,
      this.controller.retryPayment.bind(this.controller),
    );
    // PUBLIC: called server-to-server by Midtrans, authenticated via signature instead of JWT.
    this.router.post(
      '/notification',
      this.controller.notification.bind(this.controller),
    );
  }

  public getRouter() {
    return this.router;
  }
}
