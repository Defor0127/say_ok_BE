import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('point_package')
export class PointPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  pointCharge : number;

  @Column()
  requireCash : number;
}
