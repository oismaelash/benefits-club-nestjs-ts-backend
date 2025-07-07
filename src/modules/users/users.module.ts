import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'PurchasesService',
      useFactory: (purchasesService) => purchasesService,
      inject: [{ token: 'PurchasesService', optional: true }],
    },
    {
      provide: 'WishlistService',
      useFactory: (wishlistService) => wishlistService,
      inject: [{ token: 'WishlistService', optional: true }],
    },
    {
      provide: 'ReviewsService',
      useFactory: (reviewsService) => reviewsService,
      inject: [{ token: 'ReviewsService', optional: true }],
    },
  ],
  exports: [UsersService],
})
export class UsersModule {} 