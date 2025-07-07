import { Injectable, NotFoundException, ConflictException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({ name: createCategoryDto.name });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({ 
        name: updateCategoryDto.name, 
        _id: { $ne: id } 
      });
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }

  async getCategoryProducts(id: string): Promise<any[]> {
    // First verify the category exists
    await this.findOne(id);
    
    // Get products in this category
    return this.productsService.getProductsByCategory(id);
  }
} 