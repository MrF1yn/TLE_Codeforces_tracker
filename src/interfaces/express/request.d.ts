import { Request } from 'express';
import { IUser } from './user.interface';

declare module 'express' {
  interface Request {
    user?: IUser;
  }
}
