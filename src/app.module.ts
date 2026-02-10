import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { LogsController } from './logs/logs.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { getMongoConnectedMessage, getMongoUri } from '../utils/mongo';
import { logToFile } from '../utils/logger';
import { UserModule } from './user/user.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: getMongoUri(),
        connectionFactory: (connection) => {
          const message = getMongoConnectedMessage();
          console.log(message);
          void logToFile(message, 'system');
          return connection;
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    RedisModule,
    UserModule,
    WorkerModule,
  ],
  controllers: [AppController, LogsController],
  providers: [AppService],
})
export class AppModule { }
