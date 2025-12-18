import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { EntityLookupService } from '@/common/services/entity-lookup.service';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    private readonly entityLookupService: EntityLookupService
  ) { }

  async createNotice(createNoticeDto: CreateNoticeDto) {
    const noticeToCreate = this.noticeRepository.create(createNoticeDto)
    const saved = await this.noticeRepository.save(noticeToCreate)
    return {
      data: saved,
      message: "공지사항이 생성되었습니다."
    }
  }

  async getNotices() {
    const notices = await this.noticeRepository.find({
      order: { createdAt: 'DESC' }
    })
    return {
      data: notices,
      message: notices.length === 0 ? "작성된 공지사항이 없습니다." : "작성된 공지사항 목록을 반환합니다.",
    }
  }

  async getNotice(noticeId: number) {
    const notice = await this.noticeRepository.findOne({
      where: { id: noticeId }
    })
    if (!notice) {
      throw new NotFoundException("대상 공지사항이 존재하지 않습니다.")
    }
    return {
      data: notice,
      message: "대상 공지사항을 반환합니다."
    }
  }

  async searchNotices(keyword: string) {
    const notices = await this.noticeRepository.find({
      where: [
        { title: Like(`%${keyword}%`) }
      ],
      order: { createdAt: 'DESC' }
    })
    return {
      data: notices,
      message: notices.length === 0 ? "키워드에 해당하는 공지사항이 없습니다." : "키워드에 해당하는 공지사항 목록을 반환합니다.",
    }
  }

  async updateNotice(noticeId: number, updateNoticeDto: UpdateNoticeDto) {
    const noticeExist = await this.entityLookupService.findOneOrThrow(
      this.noticeRepository,
      { id: noticeId },
      "대상 공지사항을 찾을 수 없습니다."
    )
    Object.assign(noticeExist, updateNoticeDto)
    const saved = await this.noticeRepository.save(noticeExist)
    return {
      data: saved,
      message: "대상 공지사항 수정에 성공했습니다."
    }
  }

  async deleteNotice(noticeId: number) {
    const deleteResult = await this.noticeRepository.delete({ id: noticeId })
    if (!deleteResult || deleteResult.affected === 0) {
      throw new NotFoundException("대상 공지사항이 존재하지 않습니다.")
    }
    return { message: "공지사항 삭제에 성공했습니다." }
  }
}
