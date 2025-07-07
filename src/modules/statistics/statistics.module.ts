import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsCacheService } from './cache/statistics-cache.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { redisConfig } from '../../config/redis.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: redisConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    StatisticsCacheService,
    {
      provide: 'PurchasesService',
      useFactory: (purchasesService) => purchasesService,
      inject: [{ token: 'PurchasesService', optional: true }],
    },
    {
      provide: 'ReviewsService',
      useFactory: (reviewsService) => reviewsService,
      inject: [{ token: 'ReviewsService', optional: true }],
    },
    {
      provide: 'WishlistService',
      useFactory: (wishlistService) => wishlistService,
      inject: [{ token: 'WishlistService', optional: true }],
    },
  ],
  exports: [StatisticsService, StatisticsCacheService],
})
export class StatisticsModule {} 