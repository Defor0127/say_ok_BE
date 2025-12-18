import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('ticket')
  @UseGuards(JwtAuthGuard)
  async startRandomChat(
    @User('userId') userId: number
  ) {
    return this.matchService.startRandomChat(userId);
  }

  @Get('ticket/:ticketId')
  @UseGuards(JwtAuthGuard)
  async getTicketStatus(
    @User('userId') userId: number,
    @Param('ticketId') ticketId: string,
  ) {
    return this.matchService.getTicketStatus(userId, ticketId);
  }

  @Delete('ticket/:ticketId')
  @UseGuards(JwtAuthGuard)
  async cancelTicket(
    @User('userId') userId: number,
    @Param('ticketId') ticketId: string,
  ) {
    return this.matchService.cancelTicket(userId, ticketId);
  }
}
