import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from '../../user/entities/user.entity';
import { Post } from './post.entity';

@Entity('post_like')
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Users, (user) => user.postLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
