import { Module } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}

