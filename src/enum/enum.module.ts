import { Module } from '@nestjs/common';
import { EnumService } from './enum.service';
import { EnumController } from './enum.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EnumController],
  providers: [EnumService],
  exports: [EnumService],
})
export class EnumModule {}
