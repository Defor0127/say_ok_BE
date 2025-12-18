import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Users } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';
import { CommentLike } from './commentLike.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Users, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];

  @Column({ default: 0 })
  likeCount: number;

  @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentCommentId' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];
}
