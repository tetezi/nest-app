import { Module } from '@nestjs/common';
import { FormViewCompService } from './form-view-comp.service';
import { FormViewCompController } from './form-view-comp.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormViewCompController],
  providers: [FormViewCompService],
})
export class FormViewCompModule {}
