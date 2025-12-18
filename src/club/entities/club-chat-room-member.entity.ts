import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ClubChatRoom } from "./club-chat-room.entity";

@Entity('club_chat_room_member')
export class ClubChatRoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomId: string;

  @Column()
  userId: number;

  @ManyToOne(() => ClubChatRoom, (ccr) => ccr.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  clubChatRoom: ClubChatRoom;
}