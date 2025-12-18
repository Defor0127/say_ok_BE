import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from '../../user/entities/user.entity';

@Entity('point_history')
export class PointHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => Users, (user) => user.pointHistory, { onDelete: 'CASCADE' })
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
