import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from '../../user/entities/user.entity';
import { Category } from '@/category/entities/category.entity';

@Entity('senior_content')
export class SeniorContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  adminId: number;

  @ManyToOne(() => Users, (user) => user.seniorContents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: Users;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @ManyToOne(() => Category, (category) => category.posts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @Column({ nullable: true, default: 0 })
  status: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
