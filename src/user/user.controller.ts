import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import { UserService } from './user.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types';
import { RtGuard, AtGuard } from 'src/common/guards';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() payload: CreateUserDto): Promise<Tokens> {
    return this.userService.createUser(payload);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: AuthDto): Promise<Tokens> {
    return this.userService.login(dto);
  }

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: string) {
    return this.userService.logout(userId);
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.userService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AtGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@GetCurrentUser() user: any) {
    return user;
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
