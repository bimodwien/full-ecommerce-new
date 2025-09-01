import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';

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
      this.userController.register.bind(this.userController),
    );
    this.router.post(
      '/login',
      this.userController.login.bind(this.userController),
    );
    this.router.post(
      '/google',
      this.userController.googleLogin.bind(this.userController),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
