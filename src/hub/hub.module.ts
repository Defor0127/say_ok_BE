import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HubController } from './hub.controller';
import { HubService } from './hub.service';
import { SeniorContent } from './entities/senior-content.entity';
import { Category } from '@/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeniorContent, Category])],
  controllers: [HubController],
  providers: [HubService],
})
export class HubModule {}

