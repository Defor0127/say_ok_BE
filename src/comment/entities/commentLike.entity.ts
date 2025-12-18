import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from '../../user/entities/user.entity';
import { Comment } from './comment.entity';

@Entity('comment_like')
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  commentId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @ManyToOne(() => Users, (user) => user.commentLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
