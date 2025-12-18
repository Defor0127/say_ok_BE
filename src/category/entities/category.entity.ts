import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Club } from '../../club/entities/club.entity';
import { ClubSchedule } from '../../club/entities/club-schedule.entity';
import { CategoryType } from '../enum/category-type.enum';

@Entity('category')
@Index(['name', 'type'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CategoryType, default: 'NORMAL' })
  type: 'NORMAL' | 'HUB';

  @OneToMany(() => Post, (post) => post.category, { onDelete: 'RESTRICT' })
  posts: Post[];

  @OneToMany(() => Club, (club) => club.category, { onDelete: 'RESTRICT' })
  clubs: Club[];

  @OneToMany(() => ClubSchedule, (schedule) => schedule.category)
  schedules: ClubSchedule[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
