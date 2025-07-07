import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistService } from './wishlist.service';
import { WishlistController, WishlistAdminController } from './wishlist.controller';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [WishlistController, WishlistAdminController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {} 