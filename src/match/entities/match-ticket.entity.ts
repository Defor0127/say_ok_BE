import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TicketStatus } from "../enums/ticket-status.enum";
import { Users } from "@/user/entities/user.entity";

@Entity('match_ticket')
export class MatchTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ type: 'enum', enum: ['WAITING', 'MATCHED', 'CANCELED', 'EXPIRED'], default: 'WAITING' })
  status: TicketStatus

  @Column({})
  region: string;

  @Column({ type: 'enum', enum: ['FREE', 'POINTS'] })
  billingType: 'FREE' | 'POINTS'

  @Column({ nullable: true })
  cost: number

  @Column({ default: false })
  refunded: boolean

  @Column({ type: 'varchar', length: 36, nullable: true })
  roomId: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  matchSessionId: string | null;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
