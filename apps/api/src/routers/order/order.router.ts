import { Router } from 'express';
import { validateToken } from '@/middlewares/auth.middleware';
import { verifyUser, verifyAdmin } from '@/middlewares/role.middleware';
import { OrderController } from '@/controllers/order/order.controller';

export class OrderRouter {
  private router = Router();
  private controller = new OrderController();

  constructor() {
    this.initializeRoutes();
  }

  // Seller routes go first so "/admin" isn't matched as an :id by "/:id".
  private initializeRoutes() {
    this.initializeSellerRoutes();
    this.initializeBuyerRoutes();
    // PUBLIC: called server-to-server by Midtrans, authenticated via signature instead of JWT.
    this.router.post(
      '/notification',
      this.controller.notification.bind(this.controller),
    );
  }

  private initializeSellerRoutes() {
    const guards = [validateToken, verifyAdmin];
    const c = this.controller;
    this.router.get('/admin', ...guards, c.getAllAdmin.bind(c));
    this.router.get('/admin/stats', ...guards, c.getAdminStats.bind(c));
    this.router.patch('/:id/ship', ...guards, c.ship.bind(c));
    this.router.patch('/:id/cancel', ...guards, c.cancel.bind(c));
  }

  private initializeBuyerRoutes() {
    const guards = [validateToken, verifyUser];
    const c = this.controller;
    this.router.post('/', ...guards, c.create.bind(c));
    this.router.get('/', ...guards, c.getAll.bind(c));
    this.router.get('/:id', ...guards, c.getOne.bind(c));
    this.router.post('/:id/retry-payment', ...guards, c.retryPayment.bind(c));
    this.router.patch('/:id/complete', ...guards, c.complete.bind(c));
    this.router.patch('/:id/return', ...guards, c.submitReturn.bind(c));
  }

  public getRouter() {
    return this.router;
  }
}
