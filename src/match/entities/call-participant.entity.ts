import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('call_participant')
@Index(['callSessionId', 'userId'], { unique: true })
export class CallParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  callSessionId: string;

  //참가 유저 id
  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: ['INVITED', 'JOINED', 'LEFT'],
    default: 'INVITED',
  })
  state: 'INVITED' | 'JOINED' | 'LEFT';

  @Column({ type: 'datetime', nullable: true })
  lastSeenAt: Date | null;
}
