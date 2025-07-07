import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // API Specification Endpoints

  @Post('products/:id/reviews')
  @ApiOperation({ summary: 'Add a review for a product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Review created successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product or user not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User has already reviewed this product' })
  async createReview(@Param('id') productId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(productId, createReviewDto);
  }

  @Get('products/:id/reviews')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product reviews retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Filter by rating (1-5)' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of reviews to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of reviews to skip' })
  async getProductReviews(@Param('id') productId: string, @Query() filterDto: ReviewFilterDto) {
    return this.reviewsService.getProductReviews(productId, filterDto);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get a specific review by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
  async getReview(@Param('id') reviewId: string) {
    return this.reviewsService.getReviewById(reviewId);
  }

  @Put('reviews/:id')
  @ApiOperation({ summary: 'Update a specific review' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only update your own reviews' })
  async updateReview(
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: any
  ) {
    // Pass user ID for authorization check
    const userId = req.user?.id;
    return this.reviewsService.updateReview(reviewId, updateReviewDto, userId);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete a specific review' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only delete your own reviews' })
  async deleteReview(@Param('id') reviewId: string, @Request() req: any) {
    // Pass user ID for authorization check
    const userId = req.user?.id;
    await this.reviewsService.deleteReview(reviewId, userId);
    return { message: 'Review deleted successfully' };
  }

  // Enhanced Endpoints

  @Get('users/:userId/reviews')
  @ApiOperation({ summary: 'Get all reviews by a specific user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User reviews retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Filter by rating (1-5)' })
  @ApiQuery({ name: 'product_id', required: false, type: String, description: 'Filter by product ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of reviews to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of reviews to skip' })
  async getUserReviews(@Param('userId') userId: string, @Query() filterDto: ReviewFilterDto) {
    return this.reviewsService.getUserReviews(userId, filterDto);
  }

  @Get('products/:id/reviews/stats')
  @ApiOperation({ summary: 'Get rating statistics for a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product rating statistics retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async getProductRatingStats(@Param('id') productId: string) {
    return this.reviewsService.getProductRatingStats(productId);
  }
}

// Admin controller for enhanced features
@ApiTags('reviews-admin')
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsAdminController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews (admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All reviews retrieved successfully' })
  @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Filter by rating (1-5)' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'product_id', required: false, type: String, description: 'Filter by product ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of reviews to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of reviews to skip' })
  async getAllReviews(@Query() filterDto: ReviewFilterDto) {
    return this.reviewsService.getAllReviews(filterDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get overall review statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review statistics retrieved successfully' })
  async getReviewStatistics() {
    return this.reviewsService.getReviewStatistics();
  }

  @Get('top-rated-products')
  @ApiOperation({ summary: 'Get top-rated products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Top-rated products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products to return' })
  async getTopRatedProducts(@Query('limit') limit?: number) {
    return this.reviewsService.getTopRatedProducts(limit);
  }

  @Delete(':id/force')
  @ApiOperation({ summary: 'Force delete a review (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review force deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
  async forceDeleteReview(@Param('id') reviewId: string) {
    // Admin can delete any review without user authorization
    await this.reviewsService.deleteReview(reviewId);
    return { message: 'Review force deleted successfully' };
  }
} 