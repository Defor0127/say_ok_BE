import { IsNotEmpty, IsNumber } from "class-validator";

export class CancelMatch {
  @IsNotEmpty()
  @IsNumber()
  ticketId: number;
}