import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatAllowanceHistory } from '../../chat-allowance/entities/chat-allowance-history.entity';
import { ChatRoomUser } from '../../chat/entities/chatroom-user.entity';
import { UserSuspension } from './user-suspension.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loginEmail: string;

  @Column()
  hashedPassword: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  roadAddress: string;

  @Column({ nullable: true })
  detailAddress: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  lng: number;

  @Column({ nullable: true })
  favoriteCategory: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  introduction: string;

  @Column({ type: 'enum', enum: ['MAN', 'WOMAN'], nullable: true })
  gender: 'MAN' | 'WOMAN';

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' })
  role: 'USER' | 'ADMIN';

  @Column({ default: 1 })
  status: number;

  @Column({ default: 0 })
  points: number;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => ChatAllowanceHistory, (ph) => ph.user)
  chatAllowanceHistory: ChatAllowanceHistory[];

  @OneToMany(() => ChatRoomUser, (cu) => cu.user)
  chatRooms: ChatRoomUser[];

  @OneToMany(() => UserSuspension, (suspension) => suspension.user)
  suspensions: UserSuspension[];

  @Column({ type: 'int', default: 3, nullable: true })
  dailyChatCount: number;

  @Column({ type: 'int', default: 0 })
  reportedCount: number;

  @Column({ type: 'int', default: 0 })
  escrowPoints: number;

  @Column({ type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ type: 'datetime', nullable: true })
  suspendedUntil: Date;

  @Column({ type: 'int', default: 0 })
  chatAllowance: number;
}
