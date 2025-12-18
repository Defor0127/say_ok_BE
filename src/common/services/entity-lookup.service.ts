import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class EntityLookupService {
  //제네릭
  async findOneOrThrow<T>(
    // 제네릭 타입이 여기서 결정
    repo: Repository<T>,
    where: FindOptionsWhere<T>,
    message = '대상이 존재하지 않습니다.',
  ): Promise<T> {
    const entity = await repo.findOne({ where });
    if (!entity) throw new NotFoundException(message);
    return entity;
  }
}