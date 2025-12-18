import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';

@Entity('user_suspension')
export class UserSuspension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'int' })
  reportedCount: number;

  @Column({ type: 'datetime' })
  suspendedAt: Date;

  @Column({ type: 'datetime' })
  suspendedUntil: Date;

  @Column({ type: 'datetime', nullable: true })
  releasedAt: Date;

  @Column({ type: 'enum', enum: ['ACTIVE', 'RELEASED'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'RELEASED';

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

