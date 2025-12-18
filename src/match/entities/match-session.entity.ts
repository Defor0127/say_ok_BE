import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { SessionStatus } from "../enums/session-status.enum";
import { EndReason } from "../enums/end-reason.enum";

@Entity('match_session')
export class MatchSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userAId: number;

  @Column()
  userBId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  roomId: string;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date;

  @Column({ type: 'enum', enum: EndReason, nullable: true })
  endReason: EndReason;

  @CreateDateColumn()
  createdAt: Date;
}
