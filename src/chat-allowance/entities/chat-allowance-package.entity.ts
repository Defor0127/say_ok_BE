import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('chat_allowance_package')
export class ChatAllowancePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  allowanceCharge : number;

  @Column()
  requireCash : number;
}

