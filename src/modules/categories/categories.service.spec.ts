import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoriesService } from './categories.service';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let model: any;
  let mockProductsService: any;

  const mockCategory = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Category',
    description: 'Test Description',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExecReturn = {
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockCategory),
            constructor: jest.fn().mockResolvedValue(mockCategory),
            find: jest.fn().mockReturnValue(mockExecReturn),
            findOne: jest.fn().mockReturnValue(mockExecReturn),
            findById: jest.fn().mockReturnValue(mockExecReturn),
            findByIdAndUpdate: jest.fn().mockReturnValue(mockExecReturn),
            findByIdAndDelete: jest.fn().mockReturnValue(mockExecReturn),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'ProductsService',
          useValue: {
            getProductsByCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    model = module.get(getModelToken(Category.name));
    mockProductsService = module.get('ProductsService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Test Category',
      description: 'Test Description',
    };

    it('should create a new category successfully', async () => {
      const mockCreatedCategory = {
        ...mockCategory,
        save: jest.fn().mockResolvedValue(mockCategory),
      };
      
      (model as any).mockImplementation(() => mockCreatedCategory);

      const result = await service.create(createCategoryDto);

      expect(mockCreatedCategory.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [mockCategory, { ...mockCategory, _id: new Types.ObjectId() }];
      const mockSortReturn = {
        sort: jest.fn().mockReturnValue(mockExecReturn),
      };
      model.find.mockReturnValue(mockSortReturn);
      mockSortReturn.sort.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalledWith({ isActive: true });
      expect(mockSortReturn.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockExecReturn.exec.mockResolvedValue(mockCategory);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });
  });

  describe('update', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Updated Category',
      description: 'Updated Description',
    };

    it('should update category successfully', async () => {
      const updatedCategory = { ...mockCategory, ...updateCategoryDto };
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockExecReturn.exec.mockResolvedValue(updatedCategory);

      const result = await service.update('507f1f77bcf86cd799439011', updateCategoryDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateCategoryDto,
        { new: true }
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', updateCategoryDto)).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });
  });

  describe('remove', () => {
    it('should remove category successfully', async () => {
      mockExecReturn.exec.mockResolvedValue(mockCategory);

      await service.remove('507f1f77bcf86cd799439011');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });
  });
}); 