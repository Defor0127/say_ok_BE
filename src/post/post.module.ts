import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/user/entities/user.entity';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { Comment } from '@/comment/entities/comment.entity';
import { PostSave } from './entities/post-saved.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users,Post,PostLike,Comment,PostSave]),],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}

