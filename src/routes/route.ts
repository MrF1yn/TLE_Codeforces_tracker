import { Application } from 'express';
import { HomeRoute } from './home.route';
import {
  GlobalErrorMiddleware,
  NotFoundMiddleware,
  PrismaErrorMiddleware,
} from '../middlewares';
import {CronRoute} from "./cron";
import {StudentRoute} from "./student";

export class Routes {
  private homeRoute: HomeRoute;
  private studentRoute: StudentRoute;
  private cronRoute: CronRoute;
  constructor(private app: Application) {
    this.homeRoute = new HomeRoute();
    this.studentRoute = new StudentRoute();
    this.cronRoute = new CronRoute();
    this.app.use('/api', this.homeRoute.router);
    this.app.use('/api/cron', this.cronRoute.router);
    this.app.use('/api/student', this.studentRoute.router);
    this.app.use(NotFoundMiddleware.handle);
    this.app.use(PrismaErrorMiddleware.handle);
    this.app.use(GlobalErrorMiddleware.handle);
    //log all routes and middlewares by looping through the app._router.stack

  }
}
