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

  @OneToMany(() => ChatAllowanceHistory, (cah) => cah.user)
  chatAllowanceHistory: ChatAllowanceHistory[];

  @OneToMany(() => ChatRoomUser, (cu) => cu.user)
  chatRooms: ChatRoomUser[];

  @OneToMany(() => UserSuspension, (suspension) => suspension.user)
  suspensions: UserSuspension[];

  @Column({ type: 'int', default: 2, nullable: true })
  dailyChatAllowance: number;

  @Column({ type: 'int', default: 0 })
  reportedCount: number;

  @Column({ type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ type: 'datetime', nullable: true })
  suspendedUntil: Date;

  @Column({ type: 'int', default: 0 })
  chatAllowance: number;
}
