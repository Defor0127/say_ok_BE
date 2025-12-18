import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Faq } from './faq.entity';

@Entity('faq_category')
export class FaqCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Faq, (faq) => faq.category)
  faqs: Faq[];
}
