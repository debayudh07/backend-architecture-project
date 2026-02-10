import { createClient } from 'redis';
import { logToFile } from './logger';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const initRedisClient = async () => {
  const dbRaw = Number.parseInt(process.env.REDIS_DB ?? '0', 10);
  const redisDb = Number.isFinite(dbRaw) && dbRaw >= 0 ? dbRaw : 0;

  const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD ,
    database: redisDb,
    socket: {
      host:
        'redis-13360.c267.us-east-1-4.ec2.cloud.redislabs.com',
      port: 13360,
    },
  });

  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('ready', () => {
    console.log('Redis client is ready to connect');
    void logToFile('Redis connected successfully', 'system');
  });

  await client.connect();
  const ping = await client.ping();
  const pingMessage = `Redis ping: ${ping}`;
  console.log(pingMessage);
  void logToFile(pingMessage, 'system');

  return client;
};
