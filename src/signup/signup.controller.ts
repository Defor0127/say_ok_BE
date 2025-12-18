import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignUpDto } from './dto/signup.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('인증 - 회원가입')
@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일 또는 닉네임' })
  async signUp(
    @Body() signUpDto: SignUpDto
  ){
    return this.signupService.signUp(signUpDto)

  }
}

