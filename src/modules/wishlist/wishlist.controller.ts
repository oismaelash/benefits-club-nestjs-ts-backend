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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistFilterDto } from './dto/wishlist-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('wishlist')
@Controller('users/:userId/wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add a product to user wishlist' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product added to wishlist successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or product not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product already in wishlist' })
  async addToWishlist(@Param('userId') userId: string, @Body() addToWishlistDto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(userId, addToWishlistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User wishlist retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high'], description: 'Filter by priority' })
  async getUserWishlist(@Param('userId') userId: string, @Query() filterDto: WishlistFilterDto) {
    return this.wishlistService.getUserWishlist(userId, filterDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user wishlist statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist statistics retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getWishlistStatistics(@Param('userId') userId: string) {
    return this.wishlistService.getWishlistStatistics(userId);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get specific wishlist item' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist item retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found in wishlist' })
  async getWishlistItem(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.getWishlistItem(userId, productId);
  }

  @Put(':productId')
  @ApiOperation({ summary: 'Update wishlist item (priority, notifications)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist item updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found in wishlist' })
  async updateWishlistItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() updateDto: UpdateWishlistDto
  ) {
    return this.wishlistService.updateWishlistItem(userId, productId, updateDto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from user wishlist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product removed from wishlist successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or product not found' })
  async removeFromWishlist(@Param('userId') userId: string, @Param('productId') productId: string) {
    await this.wishlistService.removeFromWishlist(userId, productId);
    return { message: 'Product removed from wishlist successfully' };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire user wishlist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist cleared successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async clearWishlist(@Param('userId') userId: string) {
    await this.wishlistService.clearUserWishlist(userId);
    return { message: 'Wishlist cleared successfully' };
  }

  @Post(':productId/move-to-cart')
  @ApiOperation({ summary: 'Move product from wishlist to cart' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product moved to cart successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found in wishlist' })
  async moveToCart(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.moveToCart(userId, productId);
  }
}

// Additional controller for admin/analytics endpoints
@ApiTags('wishlist-admin')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistAdminController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get all wishlists (admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All wishlists retrieved successfully' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'product_id', required: false, type: String, description: 'Filter by product ID' })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high'], description: 'Filter by priority' })
  async getAllWishlists(@Query() filterDto: WishlistFilterDto) {
    return this.wishlistService.getAllWishlists(filterDto);
  }

  @Get('popular-products')
  @ApiOperation({ summary: 'Get most wishlisted products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Popular wishlist products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products to return' })
  async getPopularWishlistProducts(@Query('limit') limit?: number) {
    return this.wishlistService.getPopularWishlistProducts(limit);
  }
} 