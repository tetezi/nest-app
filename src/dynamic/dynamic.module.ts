import { Module } from '@nestjs/common'; 
import { TableModule } from './table/table.module';
import { TableRecoredModule } from './table-recored/table-recored.module';

@Module({
  imports: [TableModule, TableRecoredModule],
})
export class DynamicModule {}
