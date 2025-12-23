import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Guide } from './entities/guide.entity';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { EntityLookupService } from '@/common/services/entity-lookup.service';

@Injectable()
export class GuideService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    private readonly entityLookupService: EntityLookupService
  ) { }

  async createGuide(createGuideDto: CreateGuideDto) {
    const guideToCreate = this.guideRepository.create(createGuideDto)
    const saved = await this.guideRepository.save(guideToCreate)
    return {
      data: saved,
      message: "이용안내가 생성되었습니다."
    }
  }

  async getGuides() {
    const guides = await this.guideRepository.find({
      order: { createdAt: 'DESC' }
    })
    return {
      data: guides,
      message: guides.length === 0 ? "작성된 이용안내가 없습니다." : "작성된 이용안내 목록을 반환합니다.",
    }
  }

  async getGuide(guideId: number) {
    const guideToGet = await this.guideRepository.findOne({
      where: { id: guideId }
    })
    if (!guideToGet) {
      throw new NotFoundException("대상 이용안내가 존재하지 않습니다.")
    }
    return {
      data: guideToGet,
      message: "대상 이용안내를 반환합니다."
    }
  }

  async updateGuide(guideId: number, updateGuideDto: UpdateGuideDto) {
    const guideExist = await this.entityLookupService.findOneOrThrow(
      this.guideRepository,
      { id: guideId },
      "대상 이용안내를 찾을 수 없습니다."
    )
    Object.assign(guideExist, updateGuideDto)
    const saved = await this.guideRepository.save(guideExist)
    return {
      data: saved,
      message: "대상 공지사항 수정에 성공했습니다."
    }
  }

  async deleteGuide(guideId: number) {
    const deleteResult = await this.guideRepository.delete({ id: guideId })
    if (!deleteResult || deleteResult.affected === 0) {
      throw new NotFoundException("대상 이용안내가 존재하지 않습니다.")
    }
    return { message: "이용안내 삭제에 성공했습니다." }
  }
}
