import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StatisticsService } from './statistics.service';
import { StatisticsCacheService } from './cache/statistics-cache.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let mockUserModel: any;
  let mockProductModel: any;
  let mockCategoryModel: any;
  let mockPurchaseModel: any;
  let mockReviewModel: any;
  let mockWishlistModel: any;
  let mockStatisticsCacheService: any;
  let mockPurchasesService: any;
  let mockReviewsService: any;
  let mockWishlistService: any;

  beforeEach(async () => {
    mockUserModel = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    mockProductModel = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    mockCategoryModel = {
      countDocuments: jest.fn(),
      find: jest.fn(),
    };

    mockPurchaseModel = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    mockReviewModel = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    mockWishlistModel = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    mockStatisticsCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
      getUserStats: jest.fn(),
      setUserStats: jest.fn(),
      getProductStats: jest.fn(),
      setProductStats: jest.fn(),
      getPurchaseStats: jest.fn(),
      setPurchaseStats: jest.fn(),
      getReviewStats: jest.fn(),
      setReviewStats: jest.fn(),
      getWishlistStats: jest.fn(),
      setWishlistStats: jest.fn(),
      getCategoryStats: jest.fn(),
      setCategoryStats: jest.fn(),
      getOverallStats: jest.fn(),
      setOverallStats: jest.fn(),
    };

    mockPurchasesService = {
      findAll: jest.fn().mockResolvedValue([]),
      getTotalRevenue: jest.fn().mockResolvedValue(1000),
      getTopProducts: jest.fn().mockResolvedValue([]),
      getTotalPurchases: jest.fn(),
      getCompletedPurchases: jest.fn(),
    };

    mockReviewsService = {
      findAll: jest.fn().mockResolvedValue([]),
      getTopRatedProducts: jest.fn().mockResolvedValue([]),
      getAverageRating: jest.fn().mockResolvedValue(4.5),
      getTotalReviews: jest.fn(),
      getReviewsThisMonth: jest.fn(),
    };

    mockWishlistService = {
      findAll: jest.fn().mockResolvedValue([]),
      getUserWishlist: jest.fn().mockResolvedValue([]),
      getMostWishedProducts: jest.fn().mockResolvedValue([]),
      getTotalWishlists: jest.fn(),
      getTotalWishlistItems: jest.fn(),
      getAverageItemsPerWishlist: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken('Product'),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken('Category'),
          useValue: mockCategoryModel,
        },
        {
          provide: StatisticsCacheService,
          useValue: mockStatisticsCacheService,
        },
        {
          provide: 'PurchasesService',
          useValue: mockPurchasesService,
        },
        {
          provide: 'ReviewsService',
          useValue: mockReviewsService,
        },
        {
          provide: 'WishlistService',
          useValue: mockWishlistService,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserStatistics', () => {
    it('should return cached user statistics if available', async () => {
      const mockStats = {
        totalUsers: 100,
        activeUsers: 80,
        newUsersThisMonth: 20,
      };
      mockStatisticsCacheService.get.mockResolvedValue(mockStats);

      const result = await service.getUserStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('user-statistics');
      expect(result).toEqual(mockStats);
    });

    it('should calculate and cache user statistics if not cached', async () => {
      const mockStats = {
        totalUsers: 100,
        activeUsers: 80,
        newUsersThisMonth: 20,
      };
      mockStatisticsCacheService.get.mockResolvedValue(null);
      mockUserModel.countDocuments.mockResolvedValueOnce(100);
      mockUserModel.countDocuments.mockResolvedValueOnce(80);
      mockUserModel.countDocuments.mockResolvedValueOnce(20);

      const result = await service.getUserStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('user-statistics');
      expect(mockStatisticsCacheService.set).toHaveBeenCalledWith('user-statistics', mockStats, 3600);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getProductStatistics', () => {
    it('should return cached product statistics if available', async () => {
      const mockStats = {
        totalProducts: 50,
        activeProducts: 45,
        newProductsThisMonth: 5,
      };
      mockStatisticsCacheService.get.mockResolvedValue(mockStats);

      const result = await service.getProductStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('product-statistics');
      expect(result).toEqual(mockStats);
    });

    it('should calculate and cache product statistics if not cached', async () => {
      const mockStats = {
        totalProducts: 50,
        activeProducts: 45,
        newProductsThisMonth: 5,
      };
      mockStatisticsCacheService.get.mockResolvedValue(null);
      mockProductModel.countDocuments.mockResolvedValueOnce(50);
      mockProductModel.countDocuments.mockResolvedValueOnce(45);
      mockProductModel.countDocuments.mockResolvedValueOnce(5);

      const result = await service.getProductStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('product-statistics');
      expect(mockStatisticsCacheService.set).toHaveBeenCalledWith('product-statistics', mockStats, 3600);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getPurchaseStatistics', () => {
    it('should return cached purchase statistics if available', async () => {
      const mockStats = {
        totalPurchases: 200,
        completedPurchases: 180,
        totalRevenue: 15000,
      };
      mockStatisticsCacheService.get.mockResolvedValue(mockStats);

      const result = await service.getPurchaseStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('purchase-statistics');
      expect(result).toEqual(mockStats);
    });

    it('should calculate and cache purchase statistics if not cached', async () => {
      const mockStats = {
        totalPurchases: 200,
        completedPurchases: 180,
        totalRevenue: 15000,
      };
      mockStatisticsCacheService.get.mockResolvedValue(null);
      mockPurchaseModel.countDocuments.mockResolvedValueOnce(200);
      mockPurchaseModel.countDocuments.mockResolvedValueOnce(180);
      mockPurchaseModel.aggregate.mockResolvedValueOnce([{ totalRevenue: 15000 }]);

      const result = await service.getPurchaseStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('purchase-statistics');
      expect(mockStatisticsCacheService.set).toHaveBeenCalledWith('purchase-statistics', mockStats, 3600);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getReviewStatistics', () => {
    it('should return cached review statistics if available', async () => {
      const mockStats = {
        totalReviews: 300,
        averageRating: 4.2,
        reviewsThisMonth: 50,
      };
      mockStatisticsCacheService.get.mockResolvedValue(mockStats);

      const result = await service.getReviewStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('review-statistics');
      expect(result).toEqual(mockStats);
    });

    it('should calculate and cache review statistics if not cached', async () => {
      const mockStats = {
        totalReviews: 300,
        averageRating: 4.2,
        reviewsThisMonth: 50,
      };
      mockStatisticsCacheService.get.mockResolvedValue(null);
      mockReviewModel.countDocuments.mockResolvedValueOnce(300);
      mockReviewModel.aggregate.mockResolvedValueOnce([{ averageRating: 4.2 }]);
      mockReviewModel.countDocuments.mockResolvedValueOnce(50);

      const result = await service.getReviewStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('review-statistics');
      expect(mockStatisticsCacheService.set).toHaveBeenCalledWith('review-statistics', mockStats, 3600);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getWishlistStatistics', () => {
    it('should return cached wishlist statistics if available', async () => {
      const mockStats = {
        totalWishlists: 150,
        totalWishlistItems: 800,
        averageItemsPerWishlist: 5.3,
      };
      mockStatisticsCacheService.get.mockResolvedValue(mockStats);

      const result = await service.getWishlistStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('wishlist-statistics');
      expect(result).toEqual(mockStats);
    });

    it('should calculate and cache wishlist statistics if not cached', async () => {
      const mockStats = {
        totalWishlists: 150,
        totalWishlistItems: 800,
        averageItemsPerWishlist: 5.3,
      };
      mockStatisticsCacheService.get.mockResolvedValue(null);
      mockWishlistModel.countDocuments.mockResolvedValueOnce(150);
      mockWishlistModel.aggregate.mockResolvedValueOnce([{ totalItems: 800 }]);

      const result = await service.getWishlistStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('wishlist-statistics');
      expect(mockStatisticsCacheService.set).toHaveBeenCalledWith('wishlist-statistics', mockStats, 3600);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getCategoryStatistics', () => {
    it('should return cached category statistics if available', async () => {
      const mockStats = {
        totalCategories: 10,
        activeCategories: 8,
        categoriesWithProducts: 7,
      };
      mockStatisticsCacheService.get.mockResolvedValue(mockStats);

      const result = await service.getCategoryStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('category-statistics');
      expect(result).toEqual(mockStats);
    });

    it('should calculate and cache category statistics if not cached', async () => {
      const mockStats = {
        totalCategories: 10,
        activeCategories: 8,
        categoriesWithProducts: 7,
      };
      mockStatisticsCacheService.get.mockResolvedValue(null);
      mockCategoryModel.countDocuments.mockResolvedValueOnce(10);
      mockCategoryModel.countDocuments.mockResolvedValueOnce(8);
      mockProductModel.aggregate.mockResolvedValueOnce([{ count: 7 }]);

      const result = await service.getCategoryStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('category-statistics');
      expect(mockStatisticsCacheService.set).toHaveBeenCalledWith('category-statistics', mockStats, 3600);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getOverallStatistics', () => {
    it('should return cached overall statistics if available', async () => {
      const mockStats = {
        users: { totalUsers: 100, activeUsers: 80, newUsersThisMonth: 20 },
        products: { totalProducts: 50, activeProducts: 45, newProductsThisMonth: 5 },
        purchases: { totalPurchases: 200, completedPurchases: 180, totalRevenue: 15000 },
        reviews: { totalReviews: 300, averageRating: 4.2, reviewsThisMonth: 50 },
        wishlists: { totalWishlists: 150, totalWishlistItems: 800, averageItemsPerWishlist: 5.3 },
        categories: { totalCategories: 10, activeCategories: 8, categoriesWithProducts: 7 },
      };
      mockStatisticsCacheService.get.mockResolvedValue(mockStats);

      const result = await service.getOverallStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('overall-statistics');
      expect(result).toEqual(mockStats);
    });

    it('should calculate and cache overall statistics if not cached', async () => {
      mockStatisticsCacheService.get.mockResolvedValue(null);
      
      // Mock all the individual statistics methods
      jest.spyOn(service, 'getUserStatistics').mockResolvedValue({ totalUsers: 100, activeUsers: 80, newUsersThisMonth: 20 });
      jest.spyOn(service, 'getProductStatistics').mockResolvedValue({ totalProducts: 50, activeProducts: 45, newProductsThisMonth: 5 });
      jest.spyOn(service, 'getPurchaseStatistics').mockResolvedValue({ totalPurchases: 200, completedPurchases: 180, totalRevenue: 15000 });
      jest.spyOn(service, 'getReviewStatistics').mockResolvedValue({ totalReviews: 300, averageRating: 4.2, reviewsThisMonth: 50 });
      jest.spyOn(service, 'getWishlistStatistics').mockResolvedValue({ totalWishlists: 150, totalWishlistItems: 800, averageItemsPerWishlist: 5.3 });
      jest.spyOn(service, 'getCategoryStatistics').mockResolvedValue({ totalCategories: 10, activeCategories: 8, categoriesWithProducts: 7 });

      const result = await service.getOverallStatistics();

      expect(mockStatisticsCacheService.get).toHaveBeenCalledWith('overall-statistics');
      expect(mockStatisticsCacheService.set).toHaveBeenCalledWith('overall-statistics', result, 1800);
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('purchases');
      expect(result).toHaveProperty('reviews');
      expect(result).toHaveProperty('wishlists');
      expect(result).toHaveProperty('categories');
    });
  });
}); 