import { Global, Module } from '@nestjs/common';
import { EntityLookupService } from './services/entity-lookup.service';

@Global()
@Module({
  providers: [EntityLookupService],
  exports: [EntityLookupService],
})
export class CommonModule {}
