import { INestApplication, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { defineExtension } from './extension';
const getExtendsService = () => {
  return new PrismaClient().$extends(defineExtension);
};
type ExtendsServiceType = ReturnType<typeof getExtendsService>;

@Injectable()
export class PrismaService extends PrismaClient {
  public extendsService: ExtendsServiceType;
  constructor() {
    super();
    this.extendsService = this.$extends(defineExtension);
  }
}
