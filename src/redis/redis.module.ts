import { Module } from '@nestjs/common';
import { initRedisClient, REDIS_CLIENT } from '../../utils/redis';

const redisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: async () => initRedisClient(),
};

@Module({
  providers: [redisClientProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
