import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { Routes } from './routes';

export class Server {
  constructor(private app: Application) {
    this.config();
    new Routes(this.app);
  }

  private config(): void {
    const corsOptions: CorsOptions = {
      origin: '*',
    };
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
}
