import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ChatRoomUser } from './chatroom-user.entity';

@Entity('chat_room')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => ChatRoomUser, (cu) => cu.chatRoom)
  chatRoomUsers: ChatRoomUser[];
}
