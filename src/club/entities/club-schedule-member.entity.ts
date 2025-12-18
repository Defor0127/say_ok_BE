import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { ClubSchedule } from './club-schedule.entity';
import { ClubMember } from './club-member.entity';

@Entity('club_schedule_member')
export class ClubScheduleMember {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  scheduleId: number;

  @ManyToOne(() => ClubSchedule, (schedule) => schedule.attendees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scheduleId' })
  schedule: ClubSchedule;

  @Column()
  memberId: number;

  @ManyToOne(() => ClubMember, (member) => member.scheduleMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'memberId' })
  member: ClubMember;

  @Column({ type: 'enum', enum: ['ATTEND', 'CANCEL'], default: 'ATTEND' })
  status: 'ATTEND' | 'CANCEL';

  @Column({ type: 'boolean', default: false })
  paid: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
