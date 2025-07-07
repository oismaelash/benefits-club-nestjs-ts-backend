import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { StatisticsCacheService } from './cache/statistics-cache.service';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cacheService: StatisticsCacheService,
    @Inject(forwardRef(() => 'PurchasesService')) private purchasesService?: any,
    @Inject(forwardRef(() => 'ReviewsService')) private reviewsService?: any,
    @Inject(forwardRef(() => 'WishlistService')) private wishlistService?: any,
  ) {}

  async getUserStatistics(): Promise<any> {
    // Try to get from cache first
    const cachedStats = await this.cacheService.getUserStats();
    if (cachedStats) {
      return cachedStats;
    }

    // If not in cache, calculate and cache the result
    const stats = await this.calculateUserStatistics();
    await this.cacheService.setUserStats(stats);
    return stats;
  }

  private async calculateUserStatistics(): Promise<any> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic user statistics
    const totalUsers = await this.userModel.countDocuments().exec();
    const activeUsers = await this.userModel.countDocuments({ isActive: true }).exec();
    const newUsersThisMonth = await this.userModel.countDocuments({
      createdAt: { $gte: lastMonth }
    }).exec();
    const newUsersThisWeek = await this.userModel.countDocuments({
      createdAt: { $gte: lastWeek }
    }).exec();

    // User registration trends (last 12 months)
    const registrationTrends = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Most active users (if purchases service is available)
    let mostActiveUsers = [];
    if (this.purchasesService) {
      try {
        const purchases = await this.purchasesService.findAll();
        const userPurchaseCounts = purchases.reduce((acc, purchase) => {
          const userId = purchase.user.toString();
          acc[userId] = (acc[userId] || 0) + 1;
          return acc;
        }, {});

        const topUserIds = Object.entries(userPurchaseCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([userId]) => userId);

        mostActiveUsers = await this.userModel
          .find({ _id: { $in: topUserIds } })
          .select('name email createdAt')
          .exec();
      } catch (error) {
        // Fallback if purchases service is not available
        mostActiveUsers = [];
      }
    }

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      registrationTrends,
      mostActiveUsers,
      userGrowthRate: totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0,
      cached: false,
      generatedAt: new Date(),
    };
  }

  async getProductStatistics(): Promise<any> {
    // Try to get from cache first
    const cachedStats = await this.cacheService.getProductStats();
    if (cachedStats) {
      return { ...cachedStats, cached: true };
    }

    // If not in cache, calculate and cache the result
    const stats = await this.calculateProductStatistics();
    await this.cacheService.setProductStats(stats);
    return stats;
  }

  private async calculateProductStatistics(): Promise<any> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Basic product statistics
    const totalProducts = await this.productModel.countDocuments().exec();
    const activeProducts = await this.productModel.countDocuments({ isActive: true }).exec();
    const newProductsThisMonth = await this.productModel.countDocuments({
      createdAt: { $gte: lastMonth }
    }).exec();

    // Price statistics
    const priceStats = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    // Products by category
    const productsByCategory = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Most popular products (if purchases service is available)
    let mostPopularProducts = [];
    if (this.purchasesService) {
      try {
        const purchases = await this.purchasesService.findAll();
        const productPurchaseCounts = purchases.reduce((acc, purchase) => {
          const productId = purchase.product.toString();
          acc[productId] = (acc[productId] || 0) + 1;
          return acc;
        }, {});

        const topProductIds = Object.entries(productPurchaseCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([productId]) => productId);

        mostPopularProducts = await this.productModel
          .find({ _id: { $in: topProductIds } })
          .populate('category', 'name')
          .exec();
      } catch (error) {
        // Fallback if purchases service is not available
        mostPopularProducts = [];
      }
    }

    // Top rated products (if reviews service is available)
    let topRatedProducts = [];
    if (this.reviewsService) {
      try {
        topRatedProducts = await this.reviewsService.getTopRatedProducts(10);
      } catch (error) {
        topRatedProducts = [];
      }
    }

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      newProductsThisMonth,
      priceStatistics: priceStats.length > 0 ? priceStats[0] : {
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalValue: 0
      },
      productsByCategory,
      mostPopularProducts,
      topRatedProducts,
      cached: false,
      generatedAt: new Date(),
    };
  }

  async getPurchaseStatistics(): Promise<any> {
    // Try to get from cache first
    const cachedStats = await this.cacheService.getPurchaseStats();
    if (cachedStats) {
      return { ...cachedStats, cached: true };
    }

    // If not in cache, calculate and cache the result
    const stats = await this.calculatePurchaseStatistics();
    await this.cacheService.setPurchaseStats(stats);
    return stats;
  }

  private async calculatePurchaseStatistics(): Promise<any> {
    if (!this.purchasesService) {
      return {
        message: 'Purchases service not available',
        totalPurchases: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        purchasesThisMonth: 0,
        purchasesThisWeek: 0,
        purchaseTrends: [],
        topCustomers: [],
        revenueByCategory: [],
        cached: false,
        generatedAt: new Date(),
      };
    }

    try {
      const purchases = await this.purchasesService.findAll();
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalPurchases = purchases.length;
      const completedPurchases = purchases.filter(p => p.status === 'completed');
      const totalRevenue = completedPurchases.reduce((sum, purchase) => sum + purchase.price, 0);
      const averageOrderValue = completedPurchases.length > 0 ? totalRevenue / completedPurchases.length : 0;

      const purchasesThisMonth = purchases.filter(p => p.createdAt >= lastMonth).length;
      const purchasesThisWeek = purchases.filter(p => p.createdAt >= lastWeek).length;

      // Purchase trends (last 12 months)
      const purchaseTrends = purchases
        .filter(p => p.createdAt >= new Date(now.getFullYear(), now.getMonth() - 11, 1))
        .reduce((acc, purchase) => {
          const month = `${purchase.createdAt.getFullYear()}-${purchase.createdAt.getMonth() + 1}`;
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

      // Top customers
      const customerPurchaseCounts = purchases.reduce((acc, purchase) => {
        const userId = purchase.user.toString();
        acc[userId] = (acc[userId] || 0) + purchase.price;
        return acc;
      }, {});

      const topCustomerIds = Object.entries(customerPurchaseCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([userId]) => userId);

      const topCustomers = await this.userModel
        .find({ _id: { $in: topCustomerIds } })
        .select('name email')
        .exec();

      return {
        totalPurchases,
        completedPurchases: completedPurchases.length,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        purchasesThisMonth,
        purchasesThisWeek,
        purchaseTrends: Object.entries(purchaseTrends).map(([month, count]) => ({ month, count })),
        topCustomers,
        revenueGrowthRate: purchasesThisMonth > 0 ? (purchasesThisMonth / totalPurchases) * 100 : 0,
        cached: false,
        generatedAt: new Date(),
      };
    } catch (error) {
      return {
        error: 'Error fetching purchase statistics',
        totalPurchases: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        purchasesThisMonth: 0,
        purchasesThisWeek: 0,
        purchaseTrends: [],
        topCustomers: [],
        revenueByCategory: [],
        cached: false,
        generatedAt: new Date(),
      };
    }
  }

  async getReviewStatistics(): Promise<any> {
    // Try to get from cache first
    const cachedStats = await this.cacheService.getReviewStats();
    if (cachedStats) {
      return { ...cachedStats, cached: true };
    }

    // If not in cache, calculate and cache the result
    const stats = await this.calculateReviewStatistics();
    await this.cacheService.setReviewStats(stats);
    return stats;
  }

  private async calculateReviewStatistics(): Promise<any> {
    if (!this.reviewsService) {
      return {
        message: 'Reviews service not available',
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviewsThisMonth: 0,
        reviewsThisWeek: 0,
        topRatedProducts: [],
        mostActiveReviewers: [],
        cached: false,
        generatedAt: new Date(),
      };
    }

    try {
      // Get overall review statistics
      const overallStats = await this.reviewsService.getReviewStatistics();
      
      // Get top rated products
      const topRatedProducts = await this.reviewsService.getTopRatedProducts(10);

      // Additional statistics
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const allReviews = await this.reviewsService.getAllReviews();
      const reviewsThisMonth = allReviews.filter(r => r.createdAt >= lastMonth).length;
      const reviewsThisWeek = allReviews.filter(r => r.createdAt >= lastWeek).length;

      // Most active reviewers
      const reviewerCounts = allReviews.reduce((acc, review) => {
        const userId = review.user._id.toString();
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {});

      const topReviewerIds = Object.entries(reviewerCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([userId]) => userId);

      const mostActiveReviewers = await this.userModel
        .find({ _id: { $in: topReviewerIds } })
        .select('name email')
        .exec();

      return {
        ...overallStats,
        reviewsThisMonth,
        reviewsThisWeek,
        topRatedProducts,
        mostActiveReviewers,
        reviewGrowthRate: overallStats.totalReviews > 0 ? (reviewsThisMonth / overallStats.totalReviews) * 100 : 0,
        cached: false,
        generatedAt: new Date(),
      };
    } catch (error) {
      return {
        error: 'Error fetching review statistics',
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviewsThisMonth: 0,
        reviewsThisWeek: 0,
        topRatedProducts: [],
        mostActiveReviewers: [],
        cached: false,
        generatedAt: new Date(),
      };
    }
  }

  async getWishlistStatistics(): Promise<any> {
    // Try to get from cache first
    const cachedStats = await this.cacheService.getWishlistStats();
    if (cachedStats) {
      return { ...cachedStats, cached: true };
    }

    // If not in cache, calculate and cache the result
    const stats = await this.calculateWishlistStatistics();
    await this.cacheService.setWishlistStats(stats);
    return stats;
  }

  private async calculateWishlistStatistics(): Promise<any> {
    if (!this.wishlistService) {
      return {
        message: 'Wishlist service not available',
        totalWishlistItems: 0,
        uniqueUsersWithWishlists: 0,
        averageWishlistSize: 0,
        mostWishlistedProducts: [],
        wishlistTrends: [],
        cached: false,
        generatedAt: new Date(),
      };
    }

    try {
      // Get popular wishlist products
      const mostWishlistedProducts = await this.wishlistService.getPopularWishlistProducts(10);

      // Get all wishlists to calculate statistics
      const allWishlists = await this.wishlistService.getAllWishlists();
      const totalWishlistItems = allWishlists.length;

      // Calculate unique users with wishlists
      const uniqueUsers = new Set(allWishlists.map(w => w.user._id.toString()));
      const uniqueUsersWithWishlists = uniqueUsers.size;

      const averageWishlistSize = uniqueUsersWithWishlists > 0 ? totalWishlistItems / uniqueUsersWithWishlists : 0;

      // Wishlist trends (last 12 months)
      const now = new Date();
      const wishlistTrends = allWishlists
        .filter(w => w.createdAt >= new Date(now.getFullYear(), now.getMonth() - 11, 1))
        .reduce((acc, wishlist) => {
          const month = `${wishlist.createdAt.getFullYear()}-${wishlist.createdAt.getMonth() + 1}`;
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

      // Priority distribution
      const priorityDistribution = allWishlists.reduce((acc, wishlist) => {
        acc[wishlist.priority] = (acc[wishlist.priority] || 0) + 1;
        return acc;
      }, {});

      return {
        totalWishlistItems,
        uniqueUsersWithWishlists,
        averageWishlistSize: Math.round(averageWishlistSize * 100) / 100,
        mostWishlistedProducts,
        wishlistTrends: Object.entries(wishlistTrends).map(([month, count]) => ({ month, count })),
        priorityDistribution,
        wishlistEngagementRate: uniqueUsersWithWishlists > 0 ? (uniqueUsersWithWishlists / await this.userModel.countDocuments()) * 100 : 0,
        cached: false,
        generatedAt: new Date(),
      };
    } catch (error) {
      return {
        error: 'Error fetching wishlist statistics',
        totalWishlistItems: 0,
        uniqueUsersWithWishlists: 0,
        averageWishlistSize: 0,
        mostWishlistedProducts: [],
        wishlistTrends: [],
        cached: false,
        generatedAt: new Date(),
      };
    }
  }

  async getCategoryStatistics(): Promise<any> {
    // Try to get from cache first
    const cachedStats = await this.cacheService.getCategoryStats();
    if (cachedStats) {
      return { ...cachedStats, cached: true };
    }

    // If not in cache, calculate and cache the result
    const stats = await this.calculateCategoryStatistics();
    await this.cacheService.setCategoryStats(stats);
    return stats;
  }

  private async calculateCategoryStatistics(): Promise<any> {
    const totalCategories = await this.categoryModel.countDocuments().exec();
    const activeCategories = await this.categoryModel.countDocuments({ isActive: true }).exec();

    // Products per category
    const categoryProductCounts = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: '$price' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$category.name',
          productCount: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          totalValue: { $round: ['$totalValue', 2] }
        }
      },
      { $sort: { productCount: -1 } }
    ]);

    // Most popular categories (if purchases service is available)
    let mostPopularCategories = [];
    if (this.purchasesService) {
      try {
        const purchases = await this.purchasesService.findAll();
        const categoryPurchaseCounts = {};

        for (const purchase of purchases) {
          const product = await this.productModel.findById(purchase.product).populate('category').exec();
          if (product && product.category) {
            const categoryName = (product.category as any).name;
            categoryPurchaseCounts[categoryName] = (categoryPurchaseCounts[categoryName] || 0) + 1;
          }
        }

        mostPopularCategories = Object.entries(categoryPurchaseCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([categoryName, count]) => ({ categoryName, purchaseCount: count }));
      } catch (error) {
        mostPopularCategories = [];
      }
    }

    // Categories with no products
    const categoriesWithNoProducts = await this.categoryModel.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $match: {
          products: { $size: 0 },
          isActive: true
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          createdAt: 1
        }
      }
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      categoryProductCounts,
      mostPopularCategories,
      categoriesWithNoProducts,
      averageProductsPerCategory: categoryProductCounts.length > 0 ? 
        categoryProductCounts.reduce((sum, cat) => sum + cat.productCount, 0) / categoryProductCounts.length : 0,
      cached: false,
      generatedAt: new Date(),
    };
  }

  async getOverallStatistics(): Promise<any> {
    // Try to get from cache first
    const cachedStats = await this.cacheService.getOverviewStats();
    if (cachedStats) {
      return { ...cachedStats, cached: true };
    }

    // If not in cache, calculate and cache the result
    const stats = await this.calculateOverallStatistics();
    await this.cacheService.setOverviewStats(stats);
    return stats;
  }

  private async calculateOverallStatistics(): Promise<any> {
    const [userStats, productStats, purchaseStats, reviewStats, wishlistStats, categoryStats] = await Promise.all([
      this.calculateUserStatistics(),
      this.calculateProductStatistics(),
      this.calculatePurchaseStatistics(),
      this.calculateReviewStatistics(),
      this.calculateWishlistStatistics(),
      this.calculateCategoryStatistics(),
    ]);

    return {
      overview: {
        totalUsers: userStats.totalUsers,
        totalProducts: productStats.totalProducts,
        totalPurchases: purchaseStats.totalPurchases,
        totalReviews: reviewStats.totalReviews,
        totalWishlistItems: wishlistStats.totalWishlistItems,
        totalCategories: categoryStats.totalCategories,
        totalRevenue: purchaseStats.totalRevenue,
        averageRating: reviewStats.averageRating,
      },
      userStats,
      productStats,
      purchaseStats,
      reviewStats,
      wishlistStats,
      categoryStats,
      cached: false,
      generatedAt: new Date(),
    };
  }

  // Cache invalidation methods
  async invalidateUserStatsCache(): Promise<void> {
    await this.cacheService.invalidateUserStats();
  }

  async invalidateProductStatsCache(): Promise<void> {
    await this.cacheService.invalidateProductStats();
  }

  async invalidatePurchaseStatsCache(): Promise<void> {
    await this.cacheService.invalidatePurchaseStats();
  }

  async invalidateReviewStatsCache(): Promise<void> {
    await this.cacheService.invalidateReviewStats();
  }

  async invalidateWishlistStatsCache(): Promise<void> {
    await this.cacheService.invalidateWishlistStats();
  }

  async invalidateCategoryStatsCache(): Promise<void> {
    await this.cacheService.invalidateCategoryStats();
  }

  async invalidateAllStatsCache(): Promise<void> {
    await this.cacheService.invalidateAllStats();
  }
} 