import { Request, Response, NextFunction } from 'express';
import NewsletterService from '@/services/newsletter/newsletter.service';

export class NewsletterController {
  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NewsletterService.subscribe(req);
      res.status(200).json({ message: 'Subscription email sent', ...result });
    } catch (error) {
      next(error);
    }
  }
}
