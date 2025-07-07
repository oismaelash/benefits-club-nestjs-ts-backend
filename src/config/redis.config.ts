import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const redisConfig = (configService: ConfigService): CacheModuleOptions => ({
  store: redisStore,
  host: configService.get('redis.host'),
  port: configService.get('redis.port'),
  password: configService.get('redis.password'),
  db: configService.get('redis.db'),
  ttl: configService.get('redis.ttl'),
  max: 100, // Maximum number of items in cache
  isGlobal: true,
}); 