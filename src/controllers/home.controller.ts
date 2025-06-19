import { NextFunction, Request, Response } from 'express';
import { HomeService } from '../services';
import { MethodBinder } from '../utils';

export class HomeController {
  private homeService: HomeService;

  constructor() {
    MethodBinder.bind(this);
    this.homeService = new HomeService();
  }



  async openWelcome(req: Request, res: Response): Promise<Response> {
    console.log(req.body);
    return res.send({"message": "Express server is running"});
  }
}
