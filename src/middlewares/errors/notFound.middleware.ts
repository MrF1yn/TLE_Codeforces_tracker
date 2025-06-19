import { NextFunction, Request, Response } from 'express';

export class NotFoundMiddleware {
  static handle(req: Request, res: Response, next: NextFunction) {
    res.status(404).json({
      success: false,
      path: req.path,
      message: 'requested resource could not be found',
    });
  }
}
