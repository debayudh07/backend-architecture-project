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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './user.dto';
import { UserService } from './user.service';
import { AuthDto } from './dto/auth.dto';
import { TokensResponse } from './types';
import { RtGuard, AtGuard } from 'src/common/guards';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // ── Auth ──────────────────────────────────────────────────────────

  @ApiTags('Auth')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created, tokens returned.', type: TokensResponse })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() payload: CreateUserDto): Promise<TokensResponse> {
    return this.userService.createUser(payload);
  }

  @ApiTags('Auth')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'Login successful, tokens returned.', type: TokensResponse })
  @ApiResponse({ status: 403, description: 'Invalid credentials.' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: AuthDto): Promise<TokensResponse> {
    return this.userService.login(dto);
  }

  @ApiTags('Auth')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: string) {
    return this.userService.logout(userId);
  }

  @ApiTags('Auth')
  @ApiBearerAuth('refresh-token')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'New token pair returned.', type: TokensResponse })
  @ApiResponse({ status: 403, description: 'Invalid or expired refresh token.' })
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.userService.refreshTokens(userId, refreshToken);
  }

  // ── Users ─────────────────────────────────────────────────────────

  @ApiTags('Users')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(AtGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@GetCurrentUser() user: any) {
    return user;
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Get user by ID (Redis-cached)' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the user' })
  @ApiResponse({ status: 200, description: 'User found.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
