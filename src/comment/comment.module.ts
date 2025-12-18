import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@/post/entities/post.entity';
import { Users } from '@/user/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/commentLike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post,Users,Comment,CommentLike])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}

