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
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).send('Not found !');
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error : ', err.stack);
          res.status(500).send('Error !');
        } else {
          next();
        }
      },
    );
  }

  private routes(): void {
    const sampleRouter = new SampleRouter();
    const userRouter = new UserRouter();
    const categoryRouter = new CategoryRouter();

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Welcome to TokoPakBimo API!`);
    });

    this.app.use('/api/samples', sampleRouter.getRouter());
    this.app.use('/api/users', userRouter.getRouter());
    this.app.use('/api/categories', categoryRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
