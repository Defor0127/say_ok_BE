import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatRoom } from './chatroom.entity';
import { ChatRoomUser } from './chatroom-user.entity';

@Entity('chat_room_message')
export class ChatRoomMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @Column()
  senderId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({type: 'int', default: '1'})
  status: number;
}
