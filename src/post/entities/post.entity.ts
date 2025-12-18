import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Users } from '../../user/entities/user.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { PostLike } from './post-like.entity';
import { PostSave } from './post-saved.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Category, (category) => category.posts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Users, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column()
  title: string;

  @Column()
  region: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @OneToMany(() => PostSave, (like) => like.post)
  saves: PostSave[];

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @Column({ default: 1 })
  status: number;
}
