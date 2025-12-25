import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from '../../user/entities/user.entity';

@Entity('chat_allowance_history')
export class ChatAllowanceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => Users, (user) => user.chatAllowanceHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ nullable: true })
  paymentId: number;

  @Column({ nullable: true })
  use: string;

  @Column({ nullable: true })
  charge: string;

  @Column({ nullable: true })
  changes: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

