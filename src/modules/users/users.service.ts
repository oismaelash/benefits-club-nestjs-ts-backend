import { Injectable, ConflictException, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => 'PurchasesService')) private purchasesService?: any,
    @Inject(forwardRef(() => 'WishlistService')) private wishlistService?: any,
    @Inject(forwardRef(() => 'ReviewsService')) private reviewsService?: any,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({ 
        email: updateUserDto.email, 
        _id: { $ne: id } 
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async getUserProfile(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate user statistics from purchases if service is available
    let totalPurchases = 0;
    let totalSpent = 0;

    if (this.purchasesService) {
      const purchases = await this.purchasesService.findByUser(id);
      const completedPurchases = purchases.filter(p => p.status === 'completed');
      totalPurchases = completedPurchases.length;
      totalSpent = completedPurchases.reduce((sum, purchase) => sum + purchase.price, 0);
    }

    // Get wishlist count from dedicated wishlist service if available
    let wishlistCount = user.wishlist.length; // fallback to user model
    if (this.wishlistService) {
      const wishlistStats = await this.wishlistService.getWishlistStatistics(id);
      wishlistCount = wishlistStats.totalItems;
    }

    // Get review statistics from reviews service if available
    let totalReviews = 0;
    let averageRatingGiven = 0;
    if (this.reviewsService) {
      const userReviews = await this.reviewsService.getUserReviews(id);
      totalReviews = userReviews.length;
      if (totalReviews > 0) {
        const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
        averageRatingGiven = Math.round((totalRating / totalReviews) * 100) / 100;
      }
    }

    const statistics = {
      totalPurchases,
      totalSpent,
      wishlistCount,
      totalReviews,
      averageRatingGiven,
      memberSince: user.createdAt,
      isActive: user.isActive,
    };

    return {
      ...user.toObject(),
      statistics,
    };
  }

  async getUserPurchases(id: string): Promise<any[]> {
    const user = await this.userModel.findById(id).select('_id').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use the purchases service if available
    if (this.purchasesService) {
      return this.purchasesService.findByUser(id);
    }

    // Fallback to empty array if purchases service is not available
    return [];
  }

  async addToWishlist(userId: string, addToWishlistDto: AddToWishlistDto): Promise<User> {
    // Use dedicated wishlist service if available
    if (this.wishlistService) {
      await this.wishlistService.addToWishlist(userId, addToWishlistDto);
      return this.findOne(userId);
    }

    // Fallback to original implementation for backward compatibility
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productId = new Types.ObjectId(addToWishlistDto.product_id);
    
    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      throw new ConflictException('Product already in wishlist');
    }

    user.wishlist.push(productId);
    await user.save();

    return this.userModel.findById(userId).select('-password').exec();
  }

  async getWishlist(userId: string): Promise<any> {
    // Use dedicated wishlist service if available
    if (this.wishlistService) {
      const wishlistItems = await this.wishlistService.getUserWishlist(userId);
      return {
        userId,
        wishlist: wishlistItems,
      };
    }

    // Fallback to original implementation for backward compatibility
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('wishlist', 'name description price') // This would populate from products collection
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user._id,
      wishlist: user.wishlist,
    };
  }

  async removeFromWishlist(userId: string, productId: string): Promise<User> {
    // Use dedicated wishlist service if available
    if (this.wishlistService) {
      await this.wishlistService.removeFromWishlist(userId, productId);
      return this.findOne(userId);
    }

    // Fallback to original implementation for backward compatibility
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productObjectId = new Types.ObjectId(productId);
    const productIndex = user.wishlist.findIndex(id => id.equals(productObjectId));
    
    if (productIndex === -1) {
      throw new NotFoundException('Product not found in wishlist');
    }

    user.wishlist.splice(productIndex, 1);
    await user.save();

    return this.userModel.findById(userId).select('-password').exec();
  }
} 