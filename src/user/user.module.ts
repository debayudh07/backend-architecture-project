import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../schema/user.schema';
import { RedisModule } from '../redis/redis.module';
import { AtStrategy, RtStrategy } from './strategies';
import { UserListener } from './listeners/user.listener';
import { Job, JobSchema } from '../schema/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    RedisModule,
    JwtModule.register({}),
  ],
  controllers: [UserController],
  providers: [UserService, AtStrategy, RtStrategy, UserListener],
})
export class UserModule { }
