import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './schemas/review.schema';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let model: any;
  let mockUsersService: any;
  let mockProductsService: any;
  let mockReviewModel: any;
  let mockPopulateReturn: any;

  const mockReview = {
    _id: '507f1f77bcf86cd799439011',
    user_id: '507f1f77bcf86cd799439012',
    product_id: '507f1f77bcf86cd799439013',
    rating: 5,
    comment: 'Great product!',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockProduct = {
    _id: '507f1f77bcf86cd799439013',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
  };

  beforeEach(async () => {
    const mockReview = {
      _id: '507f1f77bcf86cd799439014',
      user: '507f1f77bcf86cd799439011',
      product: '507f1f77bcf86cd799439012',
      rating: 5,
      comment: 'Great product!',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
      isActive: true,
    };

    const mockProduct = {
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Product',
      price: 100,
      isActive: true,
    };

    const savedReview = {
      ...mockReview,
      _id: '507f1f77bcf86cd799439014',
    };

    mockPopulateReturn = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    // Create a constructor function that can be used with 'new'
    mockReviewModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedReview),
    }));

    // Add static methods to the constructor
    mockReviewModel.findOne = jest.fn();
    mockReviewModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockReview]),
          }),
        }),
      }),
    });
    mockReviewModel.findById = jest.fn();
    mockReviewModel.findByIdAndUpdate = jest.fn();
    mockReviewModel.aggregate = jest.fn();
    mockReviewModel.create = jest.fn();
    mockReviewModel.save = jest.fn();

    mockUsersService = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    };

    mockProductsService = {
      findOne: jest.fn().mockResolvedValue(mockProduct),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getModelToken('Review'),
          useValue: mockReviewModel,
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

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const createReviewDto = {
        user_id: '507f1f77bcf86cd799439011',
        product_id: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great product!',
      };

      const savedReview = {
        _id: '507f1f77bcf86cd799439014',
        user: '507f1f77bcf86cd799439011',
        product: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great product!',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findOne to return null (no existing review)
      mockReviewModel.findOne.mockResolvedValue(null);

      // Mock the constructor to return a mock with save method
      mockReviewModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedReview),
      }));

      // Mock findById to return populated review
      mockPopulateReturn.exec.mockResolvedValue(savedReview);
      mockReviewModel.findById.mockReturnValue(mockPopulateReturn);

      const result = await service.createReview('507f1f77bcf86cd799439013', createReviewDto);

      expect(mockUsersService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockProductsService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toEqual(savedReview);
    });

    it('should throw NotFoundException if user not found', async () => {
      const createReviewDto = {
        user_id: '507f1f77bcf86cd799439011',
        product_id: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great product!',
      };

      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.createReview('507f1f77bcf86cd799439013', createReviewDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      const createReviewDto = {
        user_id: '507f1f77bcf86cd799439011',
        product_id: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great product!',
      };

      mockUsersService.findOne.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
      });
      mockProductsService.findOne.mockResolvedValue(null);

      await expect(service.createReview('507f1f77bcf86cd799439013', createReviewDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllReviews', () => {
    it('should return all reviews', async () => {
      mockPopulateReturn.exec.mockResolvedValue([mockReview]);
      mockReviewModel.find.mockReturnValue(mockPopulateReturn);

      const result = await service.getAllReviews();

      expect(mockReviewModel.find).toHaveBeenCalled();
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('user', 'name email');
      expect(mockPopulateReturn.populate).toHaveBeenCalledWith('product', 'name description price');
      expect(result).toEqual([mockReview]);
    });
  });

  describe('getReviewById', () => {
    it('should return a review by ID', async () => {
      const reviewId = '507f1f77bcf86cd799439014';
      const mockReview = {
        _id: reviewId,
        user: '507f1f77bcf86cd799439011',
        product: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great product!',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPopulateReturn.exec.mockResolvedValue(mockReview);
      mockReviewModel.findById.mockReturnValue(mockPopulateReturn);

      const result = await service.getReviewById(reviewId);

      expect(mockReviewModel.findById).toHaveBeenCalledWith(reviewId);
      expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException if review not found', async () => {
      const reviewId = '507f1f77bcf86cd799439014';

      mockPopulateReturn.exec.mockResolvedValue(null);
      mockReviewModel.findById.mockReturnValue(mockPopulateReturn);

      await expect(service.getReviewById(reviewId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateReview', () => {
    it('should update a review', async () => {
      const reviewId = '507f1f77bcf86cd799439014';
      const updateData = { rating: 4, comment: 'Updated comment' };
      const mockReview = {
        _id: reviewId,
        user: '507f1f77bcf86cd799439011',
        product: '507f1f77bcf86cd799439012',
        rating: 4,
        comment: 'Updated comment',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findById to return the review with isActive: true
      mockReviewModel.findById.mockResolvedValue({ ...mockReview, isActive: true });
      mockPopulateReturn.exec.mockResolvedValue(mockReview);
      mockReviewModel.findByIdAndUpdate.mockReturnValue(mockPopulateReturn);

      const result = await service.updateReview(reviewId, updateData);

      expect(mockReviewModel.findById).toHaveBeenCalledWith(reviewId);
      expect(mockReviewModel.findByIdAndUpdate).toHaveBeenCalledWith(
        reviewId,
        updateData,
        { new: true },
      );
      expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException if review not found', async () => {
      const reviewId = '507f1f77bcf86cd799439014';
      const updateData = { rating: 4, comment: 'Updated comment' };

      mockReviewModel.findById.mockResolvedValue(null);

      await expect(service.updateReview(reviewId, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteReview', () => {
    it('should soft delete a review', async () => {
      const reviewId = '507f1f77bcf86cd799439014';
      const mockReview = {
        _id: reviewId,
        user: '507f1f77bcf86cd799439011',
        product: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great product!',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findById to return the review with isActive: true
      mockReviewModel.findById.mockResolvedValue({ ...mockReview, isActive: true });
      mockReviewModel.findByIdAndUpdate.mockResolvedValue(undefined);

      await service.deleteReview(reviewId);

      expect(mockReviewModel.findById).toHaveBeenCalledWith(reviewId);
      expect(mockReviewModel.findByIdAndUpdate).toHaveBeenCalledWith(
        reviewId,
        { isActive: false },
      );
    });

    it('should throw NotFoundException if review not found', async () => {
      const reviewId = '507f1f77bcf86cd799439014';

      mockReviewModel.findById.mockResolvedValue(null);

      await expect(service.deleteReview(reviewId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserReviews', () => {
    it('should return reviews by user', async () => {
      mockPopulateReturn.exec.mockResolvedValue([mockReview]);
      mockReviewModel.find.mockReturnValue(mockPopulateReturn);

      const result = await service.getUserReviews('507f1f77bcf86cd799439012');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
      expect(mockReviewModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockReview]);
    });
  });

  describe('getProductReviews', () => {
    it('should return reviews by product', async () => {
      mockPopulateReturn.exec.mockResolvedValue([mockReview]);
      mockReviewModel.find.mockReturnValue(mockPopulateReturn);

      const result = await service.getProductReviews('507f1f77bcf86cd799439013');

      expect(mockProductsService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(mockReviewModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockReview]);
    });
  });

  describe('getProductRatingStats', () => {
    it('should return average rating for a product', async () => {
      const mockAggregateResult = [{ averageRating: 4.5, totalReviews: 10 }];
      mockReviewModel.aggregate.mockResolvedValue(mockAggregateResult);

      const result = await service.getProductRatingStats('507f1f77bcf86cd799439013');

      expect(mockReviewModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({ averageRating: 4.5, totalReviews: 10 });
    });

    it('should return 0 values if no reviews found', async () => {
      mockReviewModel.aggregate.mockResolvedValue([]);

      const result = await service.getProductRatingStats('507f1f77bcf86cd799439013');

      expect(result).toEqual({ 
        averageRating: 0, 
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        }
      });
    });
  });
}); 