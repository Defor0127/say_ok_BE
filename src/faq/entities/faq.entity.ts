import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FaqCategory } from './faq-category.entity';
import { Category } from '@/category/entities/category.entity';

@Entity('faq')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.posts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
