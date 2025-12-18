import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { Users } from '@/user/entities/user.entity';
import { PointHistory } from './entities/point-history.entity';
import { PointPackage } from './entities/point-package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, PointHistory, PointPackage])],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}

