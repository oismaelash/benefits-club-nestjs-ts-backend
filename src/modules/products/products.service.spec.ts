import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockPurchasesService: any;
  let mockReviewsService: any;
  let mockCategoriesService: any;
  let mockCacheManager: any;

  const mockPurchase = {
    _id: '507f1f77bcf86cd799439011',
    user_id: '507f1f77bcf86cd799439012',
    product_id: '507f1f77bcf86cd799439013',
    quantity: 2,
    totalPrice: 199.98,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: '507f1f77bcf86cd799439014',
    isActive: true,
    averageRating: 4.5,
    totalReviews: 10,
    totalPurchases: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: '507f1f77bcf86cd799439014',
      isActive: true,
      averageRating: 4.5,
      totalReviews: 10,
      totalPurchases: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockPopulateReturn = {
    populate: jest.fn(),
    exec: jest.fn(),
  };

  const mockSortReturn = {
    sort: jest.fn(),
    exec: jest.fn(),
  };

  const mockExecReturn = {
    exec: jest.fn(),
  };

  const mockSelectReturn = {
    select: jest.fn(),
    exec: jest.fn(),
  };

  const model = {
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    new: jest.fn(),
    constructor: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn(),
    populate: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    mockPurchasesService = {
      getProductPurchases: jest.fn(),
    };

    mockReviewsService = {
      getProductRatingStats: jest.fn(),
    };

    mockCategoriesService = {
      findAll: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken('Product'),
          useValue: model,
        },
        {
          provide: 'ReviewsService',
          useValue: mockReviewsService,
        },
        {
          provide: 'PurchasesService',
          useValue: mockPurchasesService,
        },
        {
          provide: 'CategoriesService',
          useValue: mockCategoriesService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: '507f1f77bcf86cd799439012',
    };

    it('should create a new product successfully', async () => {
      const mockCreatedProduct = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      
      model.mockImplementation = jest.fn().mockReturnValue(mockCreatedProduct);

      const result = await service.create(createProductDto);

      expect(mockCreatedProduct.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should create product without category', async () => {
      const createProductDtoWithoutCategory = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
      };

      const mockCreatedProduct = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      
      model.mockImplementation = jest.fn().mockReturnValue(mockCreatedProduct);

      const result = await service.create(createProductDtoWithoutCategory);

      expect(mockCreatedProduct.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getAvailableCategories', () => {
    it('should return categories from categories service', async () => {
      const mockCategories = [mockCategory];
      mockCategoriesService.findAll.mockResolvedValue(mockCategories);

      const result = await service.getAvailableCategories();

      expect(mockCategoriesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array if categories service not available', async () => {
      service['categoriesService'] = null;

      const result = await service.getAvailableCategories();

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all active products', async () => {
      model.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll({});

      expect(model.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual([mockProduct]);
    });

    it('should filter products by price range', async () => {
      model.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll({ price_min: 50, price_max: 150 });

      expect(model.find).toHaveBeenCalledWith({
        isActive: true,
        price: { $gte: 50, $lte: 150 }
      });
      expect(result).toEqual([mockProduct]);
    });

    it('should filter products by category', async () => {
      model.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll({ category: '507f1f77bcf86cd799439012' });

      expect(model.find).toHaveBeenCalledWith({
        isActive: true,
        category: '507f1f77bcf86cd799439012'
      });
      expect(result).toEqual([mockProduct]);
    });

    it('should search products by keyword', async () => {
      model.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll({ q: 'test' });

      expect(model.find).toHaveBeenCalledWith({
        isActive: true,
        $or: [
          { name: { $regex: 'test', $options: 'i' } },
          { description: { $regex: 'test', $options: 'i' } }
        ]
      });
      expect(result).toEqual([mockProduct]);
    });

    it('should enhance products with review stats if reviews service available', async () => {
      const mockEnhancedProduct = {
        ...mockProduct,
        toObject: jest.fn().mockReturnValue({
          ...mockProduct,
          _id: mockProduct._id,
          name: mockProduct.name,
          description: mockProduct.description,
          price: mockProduct.price,
          category: mockProduct.category,
          isActive: mockProduct.isActive,
          averageRating: mockProduct.averageRating,
          totalReviews: mockProduct.totalReviews,
          totalPurchases: mockProduct.totalPurchases,
          createdAt: mockProduct.createdAt,
          updatedAt: mockProduct.updatedAt
        })
      };
      model.find.mockResolvedValue([mockEnhancedProduct]);
      mockReviewsService.getProductRatingStats.mockResolvedValue({
        averageRating: 4.5,
        totalReviews: 10
      });

      const result = await service.findAll({});

      expect(model.find).toHaveBeenCalledWith({ isActive: true });
      expect(mockReviewsService.getProductRatingStats).toHaveBeenCalledWith(mockProduct._id.toString());
      expect(result).toEqual([{
        ...mockEnhancedProduct.toObject(),
        averageRating: 4.5,
        totalReviews: 10
      }]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      model.findById.mockReturnValue(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(mockProduct);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('category', 'name description');
      expect(result).toEqual({
        ...mockProduct,
        reviewStats: undefined
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      model.findById.mockReturnValue(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Product not found')
      );
    });

    it('should enhance product with review stats if reviews service available', async () => {
      const mockEnhancedProduct = {
        ...mockProduct,
        toObject: jest.fn().mockReturnValue({
          ...mockProduct,
          _id: mockProduct._id,
          name: mockProduct.name,
          description: mockProduct.description,
          price: mockProduct.price,
          category: mockProduct.category,
          isActive: mockProduct.isActive,
          averageRating: mockProduct.averageRating,
          totalReviews: mockProduct.totalReviews,
          totalPurchases: mockProduct.totalPurchases,
          createdAt: mockProduct.createdAt,
          updatedAt: mockProduct.updatedAt
        })
      };
      model.findById.mockReturnValue(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(mockEnhancedProduct);
      mockReviewsService.getProductRatingStats.mockResolvedValue({
        averageRating: 4.5,
        totalReviews: 10
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('category', 'name description');
      expect(mockReviewsService.getProductRatingStats).toHaveBeenCalledWith(mockProduct._id.toString());
      expect(result).toEqual({
        ...mockEnhancedProduct.toObject(),
        averageRating: 4.5,
        totalReviews: 10
      });
    });
  });

  describe('update', () => {
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 150,
    };

    it('should update product successfully', async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockPopulateReturn.populate.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(updatedProduct);

      const result = await service.update('507f1f77bcf86cd799439011', updateProductDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateProductDto,
        { new: true }
      );
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('category', 'name description');
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPopulateReturn.populate.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', updateProductDto)).rejects.toThrow(
        new NotFoundException('Product not found')
      );
    });
  });

  describe('remove', () => {
    it('should remove product successfully', async () => {
      mockExecReturn.exec.mockResolvedValue(mockProduct);

      await service.remove('507f1f77bcf86cd799439011');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Product not found')
      );
    });
  });

  describe('search', () => {
    it('should search products by keyword', async () => {
      model.find.mockReturnValue(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValue(mockSortReturn);
      mockSortReturn.sort.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue([mockProduct]);

      const result = await service.search('test');

      expect(model.find).toHaveBeenCalledWith({
        isActive: true,
        $or: [
          { name: { $regex: 'test', $options: 'i' } },
          { description: { $regex: 'test', $options: 'i' } }
        ]
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getProductPurchases', () => {
    it('should return product purchases from purchases service', async () => {
      model.findById.mockReturnValue(mockSelectReturn);
      mockSelectReturn.select.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(mockProduct);
      mockPurchasesService.getProductPurchases.mockResolvedValue([mockPurchase]);

      const result = await service.getProductPurchases('507f1f77bcf86cd799439011');

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPurchasesService.getProductPurchases).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual([mockPurchase]);
    });

    it('should return empty array if purchases service not available', async () => {
      model.findById.mockReturnValue(mockSelectReturn);
      mockSelectReturn.select.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(mockProduct);
      service['purchasesService'] = undefined;

      const result = await service.getProductPurchases('507f1f77bcf86cd799439011');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if product not found', async () => {
      model.findById.mockReturnValue(mockSelectReturn);
      mockSelectReturn.select.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.getProductPurchases('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Product not found')
      );
    });
  });

  describe('incrementPurchaseCount', () => {
    it('should increment purchase count', async () => {
      mockExecReturn.exec.mockResolvedValue(mockProduct);

      await service.incrementPurchaseCount('507f1f77bcf86cd799439011');

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $inc: { totalPurchases: 1 } }
      );
    });
  });

  describe('updateRating', () => {
    it('should update product rating for new review', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct)
      });
      mockProduct.save = jest.fn().mockResolvedValue(mockProduct);

      await service.updateRating('507f1f77bcf86cd799439011', 4.5, true);

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it('should update product rating for updated review', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct)
      });
      mockProduct.save = jest.fn().mockResolvedValue(mockProduct);

      await service.updateRating('507f1f77bcf86cd799439011', 4.5, false);

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(service.updateRating('507f1f77bcf86cd799439011', 4.5, true)).rejects.toThrow(
        new NotFoundException('Product not found')
      );
    });
  });
}); 