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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Register a new product',
    description: 'Create a new product with optional category selection. Use GET /products/categories to get available categories.'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid product data' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('categories')
  @ApiOperation({ 
    summary: 'Get available categories for product creation',
    description: 'Retrieve all active categories that can be assigned to products'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories retrieved successfully' })
  async getAvailableCategories() {
    return this.productsService.getAvailableCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products with optional filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Products retrieved successfully' })
  @ApiQuery({ name: 'price_min', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'price_max', required: false, type: Number, description: 'Maximum price filter' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search keyword' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category ID' })
  async findAll(@Query() filterDto: ProductFilterDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or description' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search results retrieved successfully' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search keyword' })
  async search(@Query('q') keyword: string) {
    return this.productsService.search(keyword);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Popular products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products to return' })
  async getPopular(@Query('limit') limit?: number) {
    return this.productsService.getPopularProducts(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific product by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/purchases')
  @ApiOperation({ summary: 'Get all purchases for a specific product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product purchases retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async getProductPurchases(@Param('id') id: string) {
    return this.productsService.getProductPurchases(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid product data' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { message: 'Product deleted successfully' };
  }
} 