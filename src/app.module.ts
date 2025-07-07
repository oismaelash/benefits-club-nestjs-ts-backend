import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import configuration from './config/configuration';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(databaseConfig().uri),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: redisConfig,
      inject: [ConfigService],
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    PurchasesModule,
    WishlistModule,
    ReviewsModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {} 