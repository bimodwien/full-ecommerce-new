import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import { corsOptions } from './config';
import { SampleRouter } from './routers/sample.router';
import { UserRouter } from './routers/user.router';
import { CategoryRouter } from './routers/category.router';
import { ProductRouter } from './routers/product.router';
import { WishlistRouter } from './routers/wishlist.router';
import { CartRouter } from './routers/cart.router';
import AppError from './libs/appError';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors(corsOptions));
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // 404 handler
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'Not Found' });
      }
      next();
    });

    // Central error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        if (!req.path.startsWith('/api/')) return next(err);

        const isAppError = err instanceof AppError;
        const statusCode = isAppError ? err.statusCode : 500;
        const message = err.message || 'Internal Server Error';

        // Basic logging (could expand with winston later)
        console.error('[API ERROR]', { statusCode, message, stack: err.stack });
        if (!isAppError) {
          // Wrap unknown errors to avoid leaking internals
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        return res.status(statusCode).json({ message });
      },
    );
  }

  private routes(): void {
    const sampleRouter = new SampleRouter();
    const userRouter = new UserRouter();
    const categoryRouter = new CategoryRouter();
    const productRouter = new ProductRouter();
    const wishlistRouter = new WishlistRouter();
    const cartRouter = new CartRouter();

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Welcome to TokoPakBimo API!`);
    });

    this.app.use('/api/samples', sampleRouter.getRouter());
    this.app.use('/api/users', userRouter.getRouter());
    this.app.use('/api/categories', categoryRouter.getRouter());
    this.app.use('/api/products', productRouter.getRouter());
    this.app.use('/api/wishlists', wishlistRouter.getRouter());
    this.app.use('/api/carts', cartRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
