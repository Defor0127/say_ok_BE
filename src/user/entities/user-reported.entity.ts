import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';
import { ReportType } from '@/report/enums/report-type.enum';

@Entity('user_reported')
export class UserReported {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reporterId: number;

  @ManyToOne(() => Users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reporterId' })
  reporter: Users;

  @Column()
  reportedUserId: number;

  @ManyToOne(() => Users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser: Users;

  @Column({ type: 'enum', enum: ReportType })
  reportType: ReportType;

  @Column({ type: 'text', nullable: true })
  reportDetail: string;

  @Column({ type: 'enum', enum: ['PENDING', 'COMPLETED', 'REJECTED'], default: 'PENDING' })
  status: 'PENDING'  | 'COMPLETED' | 'REJECTED';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

