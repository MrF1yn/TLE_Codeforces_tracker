import { NextFunction, Request, Response } from 'express';

export class GlobalErrorMiddleware {
  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    console.log(err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({
      success: false,
      message,
    });
  }
}
