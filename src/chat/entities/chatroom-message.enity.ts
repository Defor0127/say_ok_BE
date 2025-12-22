import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChatRoom } from './chatroom.entity';
import { ChatRoomUser } from './chatroom-user.entity';

@Entity('chat_room_message')
@Index(['roomId', 'createdAt'])
export class ChatRoomMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @ManyToOne(() => ChatRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: ChatRoom;

  @Column()
  senderId: number;

  @ManyToOne(() => ChatRoomUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: ChatRoomUser;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({type: 'int', default: '1'})
  status: number;
}
