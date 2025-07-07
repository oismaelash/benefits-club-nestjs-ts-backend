import { Injectable, NotFoundException, ConflictException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistFilterDto } from './dto/wishlist-filter.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) {}

  async addToWishlist(userId: string, addToWishlistDto: AddToWishlistDto): Promise<Wishlist> {
    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify product exists
    const product = await this.productsService.findOne(addToWishlistDto.product_id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if product is already in wishlist
    const existingWishlistItem = await this.wishlistModel.findOne({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(addToWishlistDto.product_id),
    });

    if (existingWishlistItem) {
      throw new ConflictException('Product already in wishlist');
    }

    // Create wishlist item
    const wishlistData = {
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(addToWishlistDto.product_id),
      priority: addToWishlistDto.priority || 'medium',
      addedAt: new Date(),
    };

    const createdWishlistItem = new this.wishlistModel(wishlistData);
    const savedWishlistItem = await createdWishlistItem.save();

    // Return populated wishlist item
    return this.wishlistModel
      .findById(savedWishlistItem._id)
      .populate('user', 'name email')
      .populate('product', 'name description price category')
      .exec();
  }

  async getUserWishlist(userId: string, filterDto?: WishlistFilterDto): Promise<Wishlist[]> {
    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const query: any = { user: new Types.ObjectId(userId) };

    // Apply priority filter
    if (filterDto?.priority) {
      query.priority = filterDto.priority;
    }

    return this.wishlistModel
      .find(query)
      .populate('product', 'name description price category isActive')
      .sort({ addedAt: -1 })
      .exec();
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.wishlistModel.findOneAndDelete({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(productId),
    });

    if (!result) {
      throw new NotFoundException('Product not found in wishlist');
    }
  }

  async updateWishlistItem(userId: string, productId: string, updateDto: UpdateWishlistDto): Promise<Wishlist> {
    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wishlistItem = await this.wishlistModel
      .findOneAndUpdate(
        {
          user: new Types.ObjectId(userId),
          product: new Types.ObjectId(productId),
        },
        updateDto,
        { new: true }
      )
      .populate('user', 'name email')
      .populate('product', 'name description price category')
      .exec();

    if (!wishlistItem) {
      throw new NotFoundException('Product not found in wishlist');
    }

    return wishlistItem;
  }

  async getAllWishlists(filterDto?: WishlistFilterDto): Promise<Wishlist[]> {
    const query: any = {};

    // Apply filters
    if (filterDto?.user_id) {
      query.user = new Types.ObjectId(filterDto.user_id);
    }

    if (filterDto?.product_id) {
      query.product = new Types.ObjectId(filterDto.product_id);
    }

    if (filterDto?.priority) {
      query.priority = filterDto.priority;
    }

    return this.wishlistModel
      .find(query)
      .populate('user', 'name email')
      .populate('product', 'name description price category')
      .sort({ addedAt: -1 })
      .exec();
  }

  async getWishlistItem(userId: string, productId: string): Promise<Wishlist> {
    const wishlistItem = await this.wishlistModel
      .findOne({
        user: new Types.ObjectId(userId),
        product: new Types.ObjectId(productId),
      })
      .populate('user', 'name email')
      .populate('product', 'name description price category')
      .exec();

    if (!wishlistItem) {
      throw new NotFoundException('Product not found in wishlist');
    }

    return wishlistItem;
  }

  async clearUserWishlist(userId: string): Promise<void> {
    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.wishlistModel.deleteMany({ user: new Types.ObjectId(userId) });
  }

  async getWishlistStatistics(userId: string): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);

    const stats = await this.wishlistModel.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          highPriorityItems: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          mediumPriorityItems: {
            $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
          },
          lowPriorityItems: {
            $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
          },
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      totalItems: 0,
      highPriorityItems: 0,
      mediumPriorityItems: 0,
      lowPriorityItems: 0,
    };
  }

  async getPopularWishlistProducts(limit: number = 10): Promise<any[]> {
    return this.wishlistModel.aggregate([
      {
        $group: {
          _id: '$product',
          wishlistCount: { $sum: 1 },
          users: { $addToSet: '$user' }
        }
      },
      { $sort: { wishlistCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          product: '$product',
          wishlistCount: 1,
          uniqueUsers: { $size: '$users' }
        }
      }
    ]);
  }

  async moveToCart(userId: string, productId: string): Promise<any> {
    // This would integrate with a cart service when implemented
    // For now, we'll just remove from wishlist
    await this.removeFromWishlist(userId, productId);
    
    return { 
      message: 'Product moved to cart successfully',
      // In a real implementation, this would return cart details
    };
  }
} 