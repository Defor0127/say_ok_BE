import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Club } from './club.entity';
import { Users } from '../../user/entities/user.entity';
import { ClubScheduleMember } from './club-schedule-member.entity';

@Entity('club_member')
export class ClubMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clubId: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: ['JOIN', 'WAIT'] })
  status: 'JOIN' | 'WAIT';

  @ManyToOne(() => Club, (club) => club.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @OneToMany(() => ClubScheduleMember, (sm) => sm.member)
  scheduleMembers: ClubScheduleMember[];

  @ManyToOne(() => Users, (user) => user.clubMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}