import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let model: any;
  let mockPurchasesService: any;
  let mockWishlistService: any;
  let mockReviewsService: any;

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    isActive: true,
    wishlist: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
    toObject: jest.fn(),
  };

  const mockExecReturn = {
    exec: jest.fn(),
  };

  const mockSelectReturn = {
    select: jest.fn().mockReturnValue(mockExecReturn),
    exec: jest.fn(),
  };

  const mockPopulateReturn = {
    populate: jest.fn().mockReturnValue(mockSelectReturn),
    select: jest.fn().mockReturnValue(mockExecReturn),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockReturnValue(mockSelectReturn),
            findOne: jest.fn().mockReturnValue(mockExecReturn),
            findById: jest.fn().mockReturnValue(mockSelectReturn),
            findByIdAndUpdate: jest.fn().mockReturnValue(mockSelectReturn),
            findByIdAndDelete: jest.fn().mockReturnValue(mockExecReturn),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'PurchasesService',
          useValue: {
            findByUser: jest.fn(),
          },
        },
        {
          provide: 'WishlistService',
          useValue: {
            getWishlistStatistics: jest.fn(),
            addToWishlist: jest.fn(),
            getUserWishlist: jest.fn(),
            removeFromWishlist: jest.fn(),
          },
        },
        {
          provide: 'ReviewsService',
          useValue: {
            getUserReviews: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
    mockPurchasesService = module.get('PurchasesService');
    mockWishlistService = module.get('WishlistService');
    mockReviewsService = module.get('ReviewsService');

    // Set up the services in the UsersService
    service['purchasesService'] = mockPurchasesService;
    service['wishlistService'] = mockWishlistService;
    service['reviewsService'] = mockReviewsService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create a new user successfully', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      
      const mockCreatedUser = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };
      
      (model as any).mockImplementation(() => mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(model.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockCreatedUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      );
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [mockUser, { ...mockUser, _id: new Types.ObjectId() }];
      mockSelectReturn.exec.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(mockSelectReturn.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      mockSelectReturn.exec.mockResolvedValue(mockUser);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockSelectReturn.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockSelectReturn.exec.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockExecReturn.exec.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      mockSelectReturn.exec.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update('507f1f77bcf86cd799439011', updateUserDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateUserDto,
        { new: true }
      );
      expect(mockSelectReturn.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
    });

    it('should hash password if provided in update', async () => {
      const updateWithPassword = { ...updateUserDto, password: 'newpassword' };
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      mockSelectReturn.exec.mockResolvedValue(mockUser);

      await service.update('507f1f77bcf86cd799439011', updateWithPassword);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });

    it('should throw ConflictException if email already exists', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await expect(service.update('507f1f77bcf86cd799439011', updateUserDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      mockSelectReturn.exec.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', updateUserDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockExecReturn.exec.mockResolvedValue(mockUser);

      await service.remove('507f1f77bcf86cd799439011');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockExecReturn.exec.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockExecReturn.exec.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toEqual(mockUser);
    });

    it('should return null if credentials are invalid', async () => {
      mockExecReturn.exec.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      mockExecReturn.exec.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile with statistics', async () => {
      const mockUserWithToObject = {
        ...mockUser,
        toObject: jest.fn().mockReturnValue(mockUser),
      };
      mockSelectReturn.exec.mockResolvedValue(mockUserWithToObject);
      
      const mockPurchases = [
        { status: 'completed', price: 100 },
        { status: 'completed', price: 200 },
        { status: 'pending', price: 50 },
      ];
      mockPurchasesService.findByUser.mockResolvedValue(mockPurchases);
      mockWishlistService.getWishlistStatistics.mockResolvedValue({ totalItems: 5 });
      
      const mockReviews = [
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
      ];
      mockReviewsService.getUserReviews.mockResolvedValue(mockReviews);

      const result = await service.getUserProfile('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        ...mockUser,
        statistics: {
          totalPurchases: 2,
          totalSpent: 300,
          wishlistCount: 5,
          totalReviews: 3,
          averageRatingGiven: 4,
          memberSince: mockUser.createdAt,
          isActive: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockSelectReturn.exec.mockResolvedValue(null);

      await expect(service.getUserProfile('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('addToWishlist', () => {
    const addToWishlistDto: AddToWishlistDto = {
      product_id: '507f1f77bcf86cd799439012',
    };

    it('should add product to wishlist using wishlist service', async () => {
      mockWishlistService.addToWishlist.mockResolvedValue(undefined);
      mockSelectReturn.exec.mockResolvedValue(mockUser);

      const result = await service.addToWishlist('507f1f77bcf86cd799439011', addToWishlistDto);

      expect(mockWishlistService.addToWishlist).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        addToWishlistDto
      );
      expect(result).toEqual(mockUser);
    });

    it('should fallback to user model if wishlist service not available', async () => {
      service['wishlistService'] = null;
      const mockUserWithSave = {
        ...mockUser,
        wishlist: [],
        save: jest.fn().mockResolvedValue(mockUser),
      };
      mockExecReturn.exec.mockResolvedValue(mockUserWithSave);
      mockSelectReturn.exec.mockResolvedValue(mockUser);

      const result = await service.addToWishlist('507f1f77bcf86cd799439011', addToWishlistDto);

      expect(mockUserWithSave.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });
}); 