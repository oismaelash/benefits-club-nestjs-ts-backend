import { Controller, Get, Post, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('statistics')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get user statistics (total users, new registrations, etc.)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User statistics retrieved successfully' })
  async getUserStatistics() {
    return this.statisticsService.getUserStatistics();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product statistics (total products, most popular, etc.)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product statistics retrieved successfully' })
  async getProductStatistics() {
    return this.statisticsService.getProductStatistics();
  }

  @Get('purchases')
  @ApiOperation({ summary: 'Get purchase statistics (total purchases, revenue, etc.)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Purchase statistics retrieved successfully' })
  async getPurchaseStatistics() {
    return this.statisticsService.getPurchaseStatistics();
  }

  @Get('review')
  @ApiOperation({ summary: 'Get review statistics (total reviews, average rating, etc.)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review statistics retrieved successfully' })
  async getReviewStatistics() {
    return this.statisticsService.getReviewStatistics();
  }

  @Get('wishlist')
  @ApiOperation({ summary: 'Get wishlist statistics (total wishlist items, most popular, etc.)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist statistics retrieved successfully' })
  async getWishlistStatistics() {
    return this.statisticsService.getWishlistStatistics();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category statistics (total categories, most popular, etc.)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category statistics retrieved successfully' })
  async getCategoryStatistics() {
    return this.statisticsService.getCategoryStatistics();
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get overall platform statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Overall statistics retrieved successfully' })
  async getOverallStatistics() {
    return this.statisticsService.getOverallStatistics();
  }

  // Cache management endpoints
  @Post('cache/invalidate/users')
  @ApiOperation({ summary: 'Invalidate user statistics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User statistics cache invalidated successfully' })
  async invalidateUserStatsCache() {
    await this.statisticsService.invalidateUserStatsCache();
    return { message: 'User statistics cache invalidated successfully' };
  }

  @Post('cache/invalidate/products')
  @ApiOperation({ summary: 'Invalidate product statistics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product statistics cache invalidated successfully' })
  async invalidateProductStatsCache() {
    await this.statisticsService.invalidateProductStatsCache();
    return { message: 'Product statistics cache invalidated successfully' };
  }

  @Post('cache/invalidate/purchases')
  @ApiOperation({ summary: 'Invalidate purchase statistics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Purchase statistics cache invalidated successfully' })
  async invalidatePurchaseStatsCache() {
    await this.statisticsService.invalidatePurchaseStatsCache();
    return { message: 'Purchase statistics cache invalidated successfully' };
  }

  @Post('cache/invalidate/reviews')
  @ApiOperation({ summary: 'Invalidate review statistics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review statistics cache invalidated successfully' })
  async invalidateReviewStatsCache() {
    await this.statisticsService.invalidateReviewStatsCache();
    return { message: 'Review statistics cache invalidated successfully' };
  }

  @Post('cache/invalidate/wishlist')
  @ApiOperation({ summary: 'Invalidate wishlist statistics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist statistics cache invalidated successfully' })
  async invalidateWishlistStatsCache() {
    await this.statisticsService.invalidateWishlistStatsCache();
    return { message: 'Wishlist statistics cache invalidated successfully' };
  }

  @Post('cache/invalidate/categories')
  @ApiOperation({ summary: 'Invalidate category statistics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category statistics cache invalidated successfully' })
  async invalidateCategoryStatsCache() {
    await this.statisticsService.invalidateCategoryStatsCache();
    return { message: 'Category statistics cache invalidated successfully' };
  }

  @Post('cache/invalidate/all')
  @ApiOperation({ summary: 'Invalidate all statistics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All statistics cache invalidated successfully' })
  async invalidateAllStatsCache() {
    await this.statisticsService.invalidateAllStatsCache();
    return { message: 'All statistics cache invalidated successfully' };
  }
} 