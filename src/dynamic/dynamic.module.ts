import { Module } from '@nestjs/common';
import { TableModule } from './table/table.module';
import { TableRecoredModule } from './table-recored/table-recored.module';
import { FormModule } from './form/form.module';
import { FormViewCompModule } from './form-view-comp/form-view-comp.module';

@Module({
  imports: [TableModule, TableRecoredModule, FormModule, FormViewCompModule],
})
export class DynamicModule {}
