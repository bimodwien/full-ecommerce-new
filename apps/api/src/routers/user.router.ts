import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';
import { authLimiter } from '@/middlewares/rateLimit.middleware';

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/register',
      authLimiter,
      this.userController.register.bind(this.userController),
    );
    this.router.post(
      '/login',
      authLimiter,
      this.userController.login.bind(this.userController),
    );
    this.router.post(
      '/google',
      authLimiter,
      this.userController.googleLogin.bind(this.userController),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
