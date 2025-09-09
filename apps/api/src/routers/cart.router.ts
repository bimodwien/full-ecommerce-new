import { Router } from 'express';
import { validateToken } from '@/middlewares/auth.middleware';
import { verifyUser } from '@/middlewares/role.middleware';
import { CartController } from '@/controllers/cart.controller';

export class CartRouter {
  private router = Router();
  private controller = new CartController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/',
      validateToken,
      verifyUser,
      this.controller.getAll.bind(this.controller),
    );
    this.router.post(
      '/',
      validateToken,
      verifyUser,
      this.controller.create.bind(this.controller),
    );
    this.router.patch(
      '/:id',
      validateToken,
      verifyUser,
      this.controller.update.bind(this.controller),
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifyUser,
      this.controller.delete.bind(this.controller),
    );
  }

  public getRouter() {
    return this.router;
  }
}
