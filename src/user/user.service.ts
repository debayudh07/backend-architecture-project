import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../../utils/redis';
import { CreateUserDto } from './user.dto';
import { logToFile } from '../../utils/logger';
import { User, UserDocument } from '../schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types';
import { Job, JobDocument } from '../schema/job.schema';

const USER_CACHE_TTL_SECONDS = 120;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
    private jwtService: JwtService,
  ) { }

  async createUser(payload: CreateUserDto): Promise<Tokens> {
    const hash = await this.hashData(payload.password);
    const newUser = await this.userModel.create({
      ...payload,
      hash,
    });

    const tokens = await this.getTokens(newUser._id.toString(), newUser.email);
    await this.updateRtHash(newUser._id.toString(), tokens.refresh_token);

    await this.jobModel.create({
      type: 'user.created',
      payload: { userId: newUser._id.toString(), email: newUser.email },
    });

    return tokens;
  }

  async login(dto: AuthDto): Promise<Tokens> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRtHash(user._id.toString(), tokens.refresh_token);

    await this.jobModel.create({
      type: 'user.login',
      payload: { userId: user._id.toString() },
    });

    return tokens;
  }

  async logout(userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $unset: { hashedRt: 1 } },
    );
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRtHash(user._id.toString(), tokens.refresh_token);
    return tokens;
  }

  async updateRtHash(userId: string, rt: string) {
    const hash = await this.hashData(rt);
    await this.userModel.updateOne({ _id: userId }, { hashedRt: hash });
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'at-secret', // TODO: env
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'rt-secret', // TODO: env
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getUserById(id: string) {
    const cacheKey = this.getCacheKey(id);
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      const message = `CACHE HIT ${cacheKey}`;
      console.log(message);
      void logToFile(message, 'cache');
      return JSON.parse(cached);
    }

    const missMessage = `CACHE MISS ${cacheKey}`;
    console.log(missMessage);
    void logToFile(missMessage, 'cache');

    const user = await this.userModel.findById(id).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redis.set(cacheKey, JSON.stringify(user), {
      EX: USER_CACHE_TTL_SECONDS,
    });

    const setMessage = `CACHE SET ${cacheKey} ttl=${USER_CACHE_TTL_SECONDS}s`;
    console.log(setMessage);
    void logToFile(setMessage, 'cache');

    return user;
  }

  private getCacheKey(id: string) {
    return `user:${id}`;
  }
}
