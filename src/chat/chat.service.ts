import { Users } from '@/user/entities/user.entity';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomUser } from './entities/chatroom-user.entity';
import { ChatRoom } from './entities/chatroom.entity';
import { EntityLookupService } from '@/common/services/entity-lookup.service';
import { ChatRoomMessage } from './entities/chatroom-message.enity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(ChatRoomUser)
    private readonly chatRoomUserRepository: Repository<ChatRoomUser>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomMessage)
    private readonly chatRoomMessageRepository: Repository<ChatRoomMessage>,
    private readonly entityLookupService: EntityLookupService
  ) { }

  async getChatRoomsByUser(userId: number) {
    const getUserChatRooms = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['chatRooms']
    })
    if (!getUserChatRooms) {
      throw new NotFoundException("대상 유저가 존재하지 않습니다.")
    }
    if (getUserChatRooms.chatRooms.length === 0) {
      return {
        message: "대상 유저가 보유중인 채팅방이 없습니다.",
        data: []
      }
    }
    return {
      message: "대상 유저가 접속중인 채팅방을 조회했습니다.",
      data: getUserChatRooms.chatRooms
    }
  }

  async enterChatRoom(userId: number, roomId: string) {
    const userExist = await this.entityLookupService.findOneOrThrow(
      this.userRepository,
      { id: userId },
      "대상 유저가 존재하지 않습니다."
    )
    const roomExist = await this.entityLookupService.findOneOrThrow(
      this.chatRoomRepository,
      { id: roomId },
      "대상 채팅방이 존재하지 않습니다."
    )
    const isConnected = await this.chatRoomUserRepository.findOne({
      where: { userId, roomId }
    })
    if (isConnected) {
      return { message: "이미 대상 채팅방에 접속중인 유저입니다." }
    }
    const connect = await this.chatRoomUserRepository.create({
      userId, roomId
    })
    const saved = await this.chatRoomUserRepository.save(connect);
    return {
      data: saved,
      message: "대상 채팅방에 접속했습니다."
    }
  }

  async leaveChatRoom(userId: number, roomId: string) {
    const userExist = await this.entityLookupService.findOneOrThrow(
      this.userRepository,
      { id: userId },
      "대상 유저가 존재하지 않습니다."
    )
    const roomExist = await this.entityLookupService.findOneOrThrow(
      this.chatRoomRepository,
      { id: roomId },
      "대상 채팅방이 존재하지 않습니다."
    )
    const isConnected = await this.chatRoomUserRepository.findOne({
      where: { userId, roomId }
    })
    if (!isConnected) {
      throw new NotFoundException("대상 채팅방에 접속하지 않은 유저입니다.")
    }
    const disconnect = await this.chatRoomUserRepository.delete({
      userId, roomId
    })
    if (!disconnect || disconnect.affected === 0) {
      throw new InternalServerErrorException("채팅방 나가기에 실패했습니다.")
    }
    return {
      message: "채팅방 나가기에 성공했습니다."
    }
  }

  async sendMessage(roomId: string, userId: number, createMessageDto: CreateMessageDto){
    const roomExist = await this.entityLookupService.findOneOrThrow(
      this.chatRoomRepository,
      { id: roomId },
      "대상 채팅방이 존재하지 않습니다."
    )
    const isEnter = await this.entityLookupService.findOneOrThrow(
      this.chatRoomUserRepository,
      { userId },
      "대상 채팅방에 접속해있는 유저가 아닙니다."
    )
    const createMessage = this.chatRoomMessageRepository.create({...createMessageDto})
    const saved = await this.chatRoomMessageRepository.save(createMessage);
    return {
      data: saved,
      message: "메시지가 생성되었습니다."
    }
  }

  async getMessages(userId: number, roomId: string){
    const roomExist = await this.chatRoomRepository.findOne({
      where: { id: roomId }
    })
    if(!roomExist) {
      throw new NotFoundException("대상 채팅방을 찾을 수 없습니다.")
    }
    const isMember = await this.chatRoomUserRepository.findOne({
      where : { userId, roomId }
    })
    if(!isMember){
      throw new ForbiddenException("대상 채팅방의 멤버가 아닙니다.")
    }
    const messagesToGet = await this.chatRoomMessageRepository.findAndCount({
      where:{ roomId },
      order: { createdAt: 'DESC' }
    })
    const [ messages, total ] = messagesToGet
    return {
      data:messagesToGet,
      message: "대상 메시지를 반환합니다."
    }
  }

  //삭제 정책 자체는 까다롭게 생각할 것.
  async deleteMessage(messageId){
    const deleteResult = await this.chatRoomMessageRepository.update(
      { id: messageId },
      { status: 0}
    )
    if(!deleteResult) {
      throw new InternalServerErrorException("서버 에러가 발생했습니다.")
    }
    return {
      message: "대상 메시지를 삭제했습니다.",
      data: messageId
    }
  }

  async updateMessage(messageId: string, updateMessageDto:UpdateMessageDto) {
    const messageToUpdate = await this.chatRoomMessageRepository.findOne({
      where: {id : messageId}
    })
    if(!messageToUpdate) {
      throw new NotFoundException("대상 메시지를 찾을 수 없습니다.")
    }
    Object.assign(messageToUpdate,updateMessageDto)
    const updated = await this.chatRoomMessageRepository.save(messageToUpdate)
    return {
      data: updated,
      message: "대상 메시지 수정에 성공했습니다."
    }
  }
}