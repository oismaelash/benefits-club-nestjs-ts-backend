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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Category already exists' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories retrieved successfully' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get all products in a specific category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category products retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async getCategoryProducts(@Param('id') id: string) {
    return this.categoriesService.getCategoryProducts(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Category name already exists' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return { message: 'Category deleted successfully' };
  }
} 