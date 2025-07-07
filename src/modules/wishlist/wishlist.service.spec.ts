import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WishlistService } from './wishlist.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { Types } from 'mongoose';

describe('WishlistService', () => {
  let service: WishlistService;
  let mockModel: any;
  let mockUsersService: any;
  let mockProductsService: any;

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockProduct = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    category: 'Test Category',
  };

  const savedWishlistItem = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
    user: mockUser._id,
    product: mockProduct._id,
    priority: 'medium',
    addedAt: new Date(),
  };

  const populatedWishlistItem = {
    _id: savedWishlistItem._id,
    user: mockUser,
    product: mockProduct,
    priority: 'medium',
    addedAt: savedWishlistItem.addedAt,
  };

  beforeEach(async () => {
    const mockPopulateReturn = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(populatedWishlistItem),
    };

    mockModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(savedWishlistItem),
    }));

    mockModel.findOne = jest.fn().mockResolvedValue(null);
    mockModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([populatedWishlistItem]),
    });
    mockModel.findById = jest.fn().mockReturnValue(mockPopulateReturn);
    mockModel.findOneAndDelete = jest.fn().mockResolvedValue(savedWishlistItem);
    mockModel.findOneAndUpdate = jest.fn().mockReturnValue(mockPopulateReturn);
    mockModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });
    mockModel.aggregate = jest.fn().mockResolvedValue([]);

    mockUsersService = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    };

    mockProductsService = {
      findOne: jest.fn().mockResolvedValue(mockProduct),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getModelToken('Wishlist'),
          useValue: mockModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToWishlist', () => {
    it('should add a product to wishlist', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const addToWishlistDto = {
        product_id: '507f1f77bcf86cd799439012',
        priority: 'medium',
      };

      const result = await service.addToWishlist(userId, addToWishlistDto);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(addToWishlistDto.product_id);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        user: new Types.ObjectId(userId),
        product: new Types.ObjectId(addToWishlistDto.product_id),
      });
      expect(mockModel.findById).toHaveBeenCalledWith(savedWishlistItem._id);
      expect(result).toEqual(populatedWishlistItem);
    });
  });
}); 