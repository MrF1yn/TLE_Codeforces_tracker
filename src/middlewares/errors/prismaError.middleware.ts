import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextFunction, Request, Response } from 'express';

export class PrismaErrorMiddleware {
  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2002':
          console.log(err);
          return res.status(409).json({
            success: false,
            message: 'unique constraint violation',
          });
        case 'P2025':
        case 'P2016':
          console.log(err);
          return res.status(404).json({
            success: false,
            message: 'prisma known error',
          });
        default:
          console.log(err);
          return res.status(500).json({
            success: false,
            message: 'prisma know error',
          });
      }
    }
    next(err);
  }
}
