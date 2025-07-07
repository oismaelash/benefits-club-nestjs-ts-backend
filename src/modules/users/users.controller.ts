import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IUserJwtPayload } from '../../common/interfaces/user.interface';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: IUserJwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get user profile with statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile with statistics retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Get(':id/purchases')
  @ApiOperation({ summary: 'Get all purchases made by a specific user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User purchases retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUserPurchases(@Param('id') id: string) {
    return this.usersService.getUserPurchases(id);
  }

  @Post(':id/wishlist')
  @ApiOperation({ summary: 'Add a product to user wishlist' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product added to wishlist successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product already in wishlist' })
  async addToWishlist(@Param('id') id: string, @Body() addToWishlistDto: AddToWishlistDto) {
    return this.usersService.addToWishlist(id, addToWishlistDto);
  }

  @Get(':id/wishlist')
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User wishlist retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getWishlist(@Param('id') id: string) {
    return this.usersService.getWishlist(id);
  }

  @Delete(':id/wishlist/:product_id')
  @ApiOperation({ summary: 'Remove a product from user wishlist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product removed from wishlist successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or product not found' })
  async removeFromWishlist(@Param('id') id: string, @Param('product_id') productId: string) {
    return this.usersService.removeFromWishlist(id, productId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 