import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('point_ledger')
@Index(['idempotencyKey'], { unique: true })
export class PointLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  // 묶인 금액 , 확정 차감 금액, 환불 금액, 적립 금액
  @Column({
    type: 'enum',
    enum: ['CALL_HOLD', 'CALL_CAPTURE', 'CALL_REFUND', 'CALL_EARN'],
  })
  type: 'CALL_HOLD' | 'CALL_CAPTURE' | 'CALL_REFUND' | 'CALL_EARN';

  @Column({ type: 'int' })
  amount: number;

  @Column()
  callSessionId: string;

  @Column()
  idempotencyKey: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
