import { Injectable, NotFoundException, ConflictException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) {}

  async createReview(productId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    // Verify user exists
    const user = await this.usersService.findOne(createReviewDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify product exists
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      user: new Types.ObjectId(createReviewDto.user_id),
      product: new Types.ObjectId(productId),
    });

    if (existingReview) {
      throw new ConflictException('User has already reviewed this product');
    }

    // Create review
    const reviewData = {
      user: new Types.ObjectId(createReviewDto.user_id),
      product: new Types.ObjectId(productId),
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    };

    const createdReview = new this.reviewModel(reviewData);
    const savedReview = await createdReview.save();

    // Return populated review
    return this.reviewModel
      .findById(savedReview._id)
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .exec();
  }

  async getProductReviews(productId: string, filterDto?: ReviewFilterDto): Promise<Review[]> {
    // Verify product exists
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const query: any = { 
      product: new Types.ObjectId(productId),
      isActive: true 
    };

    // Apply rating filter
    if (filterDto?.rating) {
      query.rating = filterDto.rating;
    }

    // Apply user filter
    if (filterDto?.user_id) {
      query.user = new Types.ObjectId(filterDto.user_id);
    }

    let queryBuilder = this.reviewModel
      .find(query)
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .sort({ createdAt: -1 });

    // Apply pagination
    if (filterDto?.limit) {
      queryBuilder = queryBuilder.limit(filterDto.limit);
    }
    if (filterDto?.offset) {
      queryBuilder = queryBuilder.skip(filterDto.offset);
    }

    return queryBuilder.exec();
  }

  async getReviewById(reviewId: string): Promise<Review> {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .exec();

    if (!review || !review.isActive) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async updateReview(reviewId: string, updateReviewDto: UpdateReviewDto, userId?: string): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review || !review.isActive) {
      throw new NotFoundException('Review not found');
    }

    // Check if user is authorized to update this review
    if (userId && review.user.toString() !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(reviewId, updateReviewDto, { new: true })
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .exec();

    return updatedReview;
  }

  async deleteReview(reviewId: string, userId?: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review || !review.isActive) {
      throw new NotFoundException('Review not found');
    }

    // Check if user is authorized to delete this review
    if (userId && review.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Soft delete by setting isActive to false
    await this.reviewModel.findByIdAndUpdate(reviewId, { isActive: false });
  }

  async getAllReviews(filterDto?: ReviewFilterDto): Promise<Review[]> {
    const query: any = { isActive: true };

    // Apply filters
    if (filterDto?.rating) {
      query.rating = filterDto.rating;
    }

    if (filterDto?.user_id) {
      query.user = new Types.ObjectId(filterDto.user_id);
    }

    if (filterDto?.product_id) {
      query.product = new Types.ObjectId(filterDto.product_id);
    }

    let queryBuilder = this.reviewModel
      .find(query)
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .sort({ createdAt: -1 });

    // Apply pagination
    if (filterDto?.limit) {
      queryBuilder = queryBuilder.limit(filterDto.limit);
    }
    if (filterDto?.offset) {
      queryBuilder = queryBuilder.skip(filterDto.offset);
    }

    return queryBuilder.exec();
  }

  async getUserReviews(userId: string, filterDto?: ReviewFilterDto): Promise<Review[]> {
    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const query: any = { 
      user: new Types.ObjectId(userId),
      isActive: true 
    };

    // Apply rating filter
    if (filterDto?.rating) {
      query.rating = filterDto.rating;
    }

    // Apply product filter
    if (filterDto?.product_id) {
      query.product = new Types.ObjectId(filterDto.product_id);
    }

    let queryBuilder = this.reviewModel
      .find(query)
      .populate('product', 'name description price')
      .sort({ createdAt: -1 });

    // Apply pagination
    if (filterDto?.limit) {
      queryBuilder = queryBuilder.limit(filterDto.limit);
    }
    if (filterDto?.offset) {
      queryBuilder = queryBuilder.skip(filterDto.offset);
    }

    return queryBuilder.exec();
  }

  async getProductRatingStats(productId: string): Promise<any> {
    const stats = await this.reviewModel.aggregate([
      { 
        $match: { 
          product: new Types.ObjectId(productId),
          isActive: true 
        } 
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          averageRating: { $round: ['$averageRating', 2] },
          ratingDistribution: {
            1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
            2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
            3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
            4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
            5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
          }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  async getReviewStatistics(): Promise<any> {
    const stats = await this.reviewModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          averageRating: { $round: ['$averageRating', 2] },
          ratingDistribution: {
            1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
            2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
            3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
            4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
            5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
          }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  async getTopRatedProducts(limit: number = 10): Promise<any[]> {
    return this.reviewModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      },
      { $match: { totalReviews: { $gte: 1 } } }, // At least 1 review
      { $sort: { averageRating: -1, totalReviews: -1 } },
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
          averageRating: { $round: ['$averageRating', 2] },
          totalReviews: 1
        }
      }
    ]);
  }
} 