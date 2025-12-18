import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChatRoom } from './chatroom.entity';
import { Users } from '../../user/entities/user.entity';

@Entity('chat_room_user')
export class ChatRoomUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoom, (room) => room.chatRoomUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  chatRoom: ChatRoom;

  @Column()
  roomId: string;

  @ManyToOne(() => Users, (user) => user.chatRooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column()
  userId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
