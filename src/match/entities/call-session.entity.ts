import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CallStatus } from '../enums/call-status.enum';


@Entity('call_session')
@Index(['matchSessionId', 'status'])
export class CallSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchSessionId: string;

  @Column()
  callerId: number;

  @Column()
  calleeId: number;

  //통화상태
  @Column({ type: 'enum', enum: ['RINGING', 'ONGOING', 'DECLINED', 'ENDED', 'TIMEOUT'] })
  status: CallStatus

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastBilledAt: Date | null;

  //통화 중 에스크로로 묶인 총합
  @Column({ type: 'int', default: 0 })
  heldTotal: number;

  //확정으로 차감된 금액
  @Column({ type: 'int', default: 0 })
  capturedTotal: number;

  //상대에게 적립된 금액
  @Column({ type: 'int', default: 0 })
  earnedTotal: number;

  @Column({ type: 'datetime', nullable: true })
  settledAt: Date | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
