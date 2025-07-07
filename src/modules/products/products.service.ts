import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => 'PurchasesService')) private purchasesService?: any,
    @Inject(forwardRef(() => 'ReviewsService')) private reviewsService?: any,
    @Inject(forwardRef(() => 'CategoriesService')) private categoriesService?: any,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const productData = {
      ...createProductDto,
      category: createProductDto.category ? new Types.ObjectId(createProductDto.category) : undefined,
    };

    const createdProduct = new this.productModel(productData);
    return createdProduct.save();
  }

  async getAvailableCategories(): Promise<any[]> {
    if (this.categoriesService) {
      return this.categoriesService.findAll();
    }
    return [];
  }

  async findAll(filterDto?: ProductFilterDto): Promise<Product[]> {
    const query: any = { isActive: true };

    // Apply price filters
    if (filterDto?.price_min !== undefined || filterDto?.price_max !== undefined) {
      query.price = {};
      if (filterDto.price_min !== undefined) {
        query.price.$gte = filterDto.price_min;
      }
      if (filterDto.price_max !== undefined) {
        query.price.$lte = filterDto.price_max;
      }
    }

    // Apply category filter
    if (filterDto?.category) {
      query.category = new Types.ObjectId(filterDto.category);
    }

    // Apply search filter
    if (filterDto?.q) {
      query.$or = [
        { name: { $regex: filterDto.q, $options: 'i' } },
        { description: { $regex: filterDto.q, $options: 'i' } },
      ];
    }

    const products = await this.productModel
      .find(query)
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .exec();

    // Enhance products with review statistics if reviews service is available
    if (this.reviewsService) {
      const enhancedProducts = await Promise.all(
        products.map(async (product) => {
          const reviewStats = await this.reviewsService.getProductRatingStats(product._id.toString());
          return {
            ...product.toObject(),
            reviewStats,
          };
        })
      );
      return enhancedProducts as any;
    }

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name description')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Enhance product with review statistics if reviews service is available
    if (this.reviewsService) {
      const reviewStats = await this.reviewsService.getProductRatingStats(id);
      return {
        ...product.toObject(),
        reviewStats,
      } as any;
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updateData = {
      ...updateProductDto,
      category: updateProductDto.category ? new Types.ObjectId(updateProductDto.category) : undefined,
    };

    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category', 'name description')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async search(keyword: string): Promise<Product[]> {
    const products = await this.productModel
      .find({
        isActive: true,
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ],
      })
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .exec();

    // Enhance products with review statistics if reviews service is available
    if (this.reviewsService) {
      const enhancedProducts = await Promise.all(
        products.map(async (product) => {
          const reviewStats = await this.reviewsService.getProductRatingStats(product._id.toString());
          return {
            ...product.toObject(),
            reviewStats,
          };
        })
      );
      return enhancedProducts as any;
    }

    return products;
  }

  async getProductPurchases(id: string): Promise<any[]> {
    const product = await this.productModel.findById(id).select('_id').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Use the purchases service if available
    if (this.purchasesService) {
      return this.purchasesService.findByProduct(id);
    }

    // Fallback to empty array if purchases service is not available
    return [];
  }

  async incrementPurchaseCount(id: string): Promise<void> {
    await this.productModel.findByIdAndUpdate(id, { $inc: { totalPurchases: 1 } }).exec();
  }

  async updateRating(id: string, newRating: number, isNewReview: boolean): Promise<void> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (isNewReview) {
      const totalRating = product.averageRating * product.totalReviews + newRating;
      const newTotalReviews = product.totalReviews + 1;
      const newAverageRating = totalRating / newTotalReviews;

      await this.productModel.findByIdAndUpdate(id, {
        averageRating: Math.round(newAverageRating * 100) / 100,
        totalReviews: newTotalReviews,
      }).exec();
    }
  }

  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    const products = await this.productModel
      .find({ isActive: true })
      .sort({ totalPurchases: -1, averageRating: -1 })
      .limit(limit)
      .populate('category', 'name description')
      .exec();

    // Enhance products with review statistics if reviews service is available
    if (this.reviewsService) {
      const enhancedProducts = await Promise.all(
        products.map(async (product) => {
          const reviewStats = await this.reviewsService.getProductRatingStats(product._id.toString());
          return {
            ...product.toObject(),
            reviewStats,
          };
        })
      );
      return enhancedProducts as any;
    }

    return products;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.productModel
      .find({ category: new Types.ObjectId(categoryId), isActive: true })
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .exec();

    // Enhance products with review statistics if reviews service is available
    if (this.reviewsService) {
      const enhancedProducts = await Promise.all(
        products.map(async (product) => {
          const reviewStats = await this.reviewsService.getProductRatingStats(product._id.toString());
          return {
            ...product.toObject(),
            reviewStats,
          };
        })
      );
      return enhancedProducts as any;
    }

    return products;
  }
} 