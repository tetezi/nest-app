import { Module } from '@nestjs/common';
import { TableRecoredService } from './table-recored.service';
import { TableRecoredController } from './table-recored.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TableModule } from '../table/table.module';

@Module({
  imports: [PrismaModule, TableModule],
  controllers: [TableRecoredController],
  providers: [TableRecoredService],
})
export class TableRecoredModule {}
