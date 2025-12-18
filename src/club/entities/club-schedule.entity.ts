import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Club } from './club.entity';
import { Category } from '../../category/entities/category.entity';
import { ClubScheduleMember } from './club-schedule-member.entity';

@Entity('club_schedule')
export class ClubSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clubId: number;

  @ManyToOne(() => Club, (club) => club.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.schedules)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @OneToMany(() => ClubScheduleMember, (sm) => sm.schedule)
  attendees: ClubScheduleMember[];

  @Column()
  place: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: 0 })
  maxAttendee: number;

  @Column({ type: 'enum', enum: ['FREE', 'PAID'] })
  type: 'FREE' | 'PAID';

  @Column({ default: 0 , nullable: true })
  price: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
