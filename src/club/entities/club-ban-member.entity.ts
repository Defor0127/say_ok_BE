import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Club } from './club.entity';
import { Users } from '../../user/entities/user.entity';

@Entity('club_ban_member')
export class ClubBanMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clubId: number;

  @Column()
  banUserId: number;

  @ManyToOne(() => Club, (club) => club.bannedMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @ManyToOne(() => Users, (user) => user.clubBanned, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'banUserId' })
  banUser: Users;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
