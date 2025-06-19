
import {PrismaClient} from "@prisma/client";
import {CustomError} from "../utils";

export class HomeService {
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }
}
