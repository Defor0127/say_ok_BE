import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { Club } from '@/club/entities/club.entity';
import { Post } from '@/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Club, Post])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}

