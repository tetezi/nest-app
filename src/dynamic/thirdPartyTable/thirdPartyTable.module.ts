import { Module } from '@nestjs/common';
import { ThirdPartyTableService } from './thirdPartyTable.service';
import { ThirdPartyTableController } from './thirdPartyTable.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ThirdPartyTableController],
  providers: [ThirdPartyTableService],
  exports: [ThirdPartyTableService],
})
export class ThirdPartyTableModule {}
