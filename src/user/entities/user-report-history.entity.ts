import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_report_history')
export class UserReportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;





}