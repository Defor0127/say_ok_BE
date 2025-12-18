import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Users } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { ClubMember } from './club-member.entity';
import { ClubBanMember } from './club-ban-member.entity';
import { ClubSchedule } from './club-schedule.entity';
import { ClubChatRoom } from './club-chat-room.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';

@Entity('club')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  leaderId: number;

  @ManyToOne(() => Users, (user) => user.leadingClubs)
  @JoinColumn({ name: 'leaderId' })
  leader: Users;

  @Column()
  clubName: string;

  @Column()
  categoryId: number;

  @ManyToOne(() => Users, (user) => user.clubs)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Category, (category) => category.clubs, { onDelete:'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  introduction: string;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  lng: number;

  @Column({ type: 'enum', enum: ['FREE', 'PAID'] })
  type: 'FREE' | 'PAID';

  @Column({ type: 'enum', enum: ['AUTO', 'APPROVAL'], default: 'AUTO' })
  joinMode: 'AUTO' | 'APPROVAL';

  @Column({ type: 'enum', enum: ['ACTIVE', 'PAUSE', 'DELETED', 'AWAITING'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'PAUSE' | 'DELETED' | 'AWAITING';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => ClubMember, (member: ClubMember) => member.club)
  members: ClubMember[];

  @OneToMany(() => ClubBanMember, (ban: ClubBanMember) => ban.club)
  bannedMembers: ClubBanMember[];

  @OneToMany(() => ClubSchedule, (schedule: ClubSchedule) => schedule.club)
  schedules: ClubSchedule[];

  @OneToMany(() => ClubChatRoom, (cc: ClubChatRoom) => cc.club)
  chatRooms: ClubChatRoom[];
}
