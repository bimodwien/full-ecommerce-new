import { NewsletterController } from '@/controllers/newsletter/newsletter.controller';
import { Router } from 'express';
import { newsletterLimiter } from '@/middlewares/rateLimit.middleware';

export class NewsletterRouter {
  private router = Router();
  private controller = new NewsletterController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/subscribe',
      newsletterLimiter,
      this.controller.subscribe.bind(this.controller),
    );
  }

  public getRouter() {
    return this.router;
  }
}
