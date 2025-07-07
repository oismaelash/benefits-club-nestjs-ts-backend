import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
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
      provide: 'CategoriesService',
      useFactory: (categoriesService) => categoriesService,
      inject: [{ token: 'CategoriesService', optional: true }],
    },
  ],
  exports: [ProductsService],
})
export class ProductsModule {} 