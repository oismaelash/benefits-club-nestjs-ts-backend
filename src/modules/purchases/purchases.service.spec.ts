import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PurchasesService } from './purchases.service';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let model: any;
  let mockUsersService: any;
  let mockProductsService: any;

  const mockPurchase = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    user: new Types.ObjectId('507f1f77bcf86cd799439012'),
    product: new Types.ObjectId('507f1f77bcf86cd799439013'),
    price: 100,
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockProduct = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Test Product',
    price: 100,
  };

  const mockExecReturn = {
    exec: jest.fn(),
  };

  const mockPopulateReturn = {
    populate: jest.fn().mockReturnValue(mockExecReturn),
    sort: jest.fn().mockReturnValue(mockExecReturn),
    exec: jest.fn(),
  };

  const mockSortReturn = {
    sort: jest.fn().mockReturnValue(mockExecReturn),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        {
          provide: getModelToken(Purchase.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockPurchase),
            constructor: jest.fn().mockResolvedValue(mockPurchase),
            find: jest.fn().mockReturnValue(mockPopulateReturn),
            findOne: jest.fn().mockReturnValue(mockExecReturn),
            findById: jest.fn().mockReturnValue(mockPopulateReturn),
            findByIdAndDelete: jest.fn().mockReturnValue(mockExecReturn),
            create: jest.fn(),
            save: jest.fn(),
            aggregate: jest.fn(),
          },
        },
        {
          provide: 'UsersService',
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: 'ProductsService',
          useValue: {
            findOne: jest.fn(),
            incrementPurchaseCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
    model = module.get(getModelToken(Purchase.name));
    mockUsersService = module.get('UsersService');
    mockProductsService = module.get('ProductsService');

    // Set up the services in the PurchasesService
    service['usersService'] = mockUsersService;
    service['productsService'] = mockProductsService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPurchaseDto: CreatePurchaseDto = {
      user_id: '507f1f77bcf86cd799439012',
      product_id: '507f1f77bcf86cd799439013',
    };

    it('should create a new purchase successfully', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockProductsService.incrementPurchaseCount.mockResolvedValue(undefined);

      const mockCreatedPurchase = {
        ...mockPurchase,
        save: jest.fn().mockResolvedValue(mockPurchase),
      };
      
      (model as any).mockImplementation(() => mockCreatedPurchase);

      const result = await service.create(createPurchaseDto);

      expect(mockUsersService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
      expect(mockProductsService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(mockProductsService.incrementPurchaseCount).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(mockCreatedPurchase.save).toHaveBeenCalled();
      expect(result).toEqual(mockPurchase);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.create(createPurchaseDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockProductsService.findOne.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(service.create(createPurchaseDto)).rejects.toThrow(
        new NotFoundException('Product not found')
      );
    });
  });

  describe('findAll', () => {
    it('should return all purchases', async () => {
      const mockPurchases = [mockPurchase];
      mockPopulateReturn.populate.mockReturnValueOnce(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValueOnce(mockSortReturn);
      mockSortReturn.exec.mockResolvedValue(mockPurchases);

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('user', 'name email');
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('product', 'name price');
      expect(mockSortReturn.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('findOne', () => {
    it('should return a purchase by id', async () => {
      mockPopulateReturn.populate.mockReturnValueOnce(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValueOnce(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(mockPurchase);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('user', 'name email');
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('product', 'name price');
      expect(result).toEqual(mockPurchase);
    });

    it('should throw NotFoundException if purchase not found', async () => {
      mockPopulateReturn.populate.mockReturnValueOnce(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValueOnce(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Purchase not found')
      );
    });
  });

  describe('remove', () => {
    it('should remove purchase successfully', async () => {
      mockExecReturn.exec.mockResolvedValue(mockPurchase);

      await service.remove('507f1f77bcf86cd799439011');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if purchase not found', async () => {
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Purchase not found')
      );
    });
  });

  describe('findByUser', () => {
    it('should return purchases by user id', async () => {
      const mockPurchases = [mockPurchase];
      mockPopulateReturn.populate.mockReturnValueOnce(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValueOnce(mockSortReturn);
      mockSortReturn.exec.mockResolvedValue(mockPurchases);

      const result = await service.findByUser('507f1f77bcf86cd799439012');

      expect(model.find).toHaveBeenCalledWith({ user: new Types.ObjectId('507f1f77bcf86cd799439012') });
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('findByProduct', () => {
    it('should return purchases for a specific product', async () => {
      const mockPurchases = [mockPurchase];
      model.find.mockReturnValue(mockPopulateReturn);
      mockPopulateReturn.populate.mockReturnValue(mockSortReturn);
      mockSortReturn.sort.mockReturnValue(mockExecReturn);
      mockExecReturn.exec.mockResolvedValue(mockPurchases);

      const result = await service.findByProduct('507f1f77bcf86cd799439013');

      expect(model.find).toHaveBeenCalledWith({ product: new Types.ObjectId('507f1f77bcf86cd799439013') });
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('getTotalRevenue', () => {
    it('should calculate total revenue from completed purchases', async () => {
      const mockResult = [{ _id: null, total: 300 }];
      model.aggregate.mockResolvedValue(mockResult);

      const result = await service.getTotalRevenue();

      expect(model.aggregate).toHaveBeenCalledWith([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);
      expect(result).toBe(300);
    });

    it('should return 0 if no completed purchases', async () => {
      model.aggregate.mockResolvedValue([]);

      const result = await service.getTotalRevenue();

      expect(result).toBe(0);
    });
  });
}); 