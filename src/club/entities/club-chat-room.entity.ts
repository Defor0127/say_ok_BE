import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Club } from './club.entity';
import { ClubChatRoomMember } from './club-chat-room-member.entity';

@Entity('club_chat_room')
export class ClubChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clubId: number;

  @ManyToOne(() => Club, (club) => club.chatRooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @OneToMany(() => ClubChatRoomMember, (member: ClubChatRoomMember) => member.clubChatRoom)
  members: ClubChatRoomMember[];
}
