import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsService } from './reviews.service';
import { ReviewsController, ReviewsAdminController } from './reviews.controller';
import { Review, ReviewSchema } from './schemas/review.schema';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [ReviewsController, ReviewsAdminController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {} 