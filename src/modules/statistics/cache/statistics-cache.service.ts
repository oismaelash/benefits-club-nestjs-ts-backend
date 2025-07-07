import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class StatisticsCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Cache keys
  private static readonly CACHE_KEYS = {
    USER_STATS: 'stats:users',
    PRODUCT_STATS: 'stats:products',
    PURCHASE_STATS: 'stats:purchases',
    REVIEW_STATS: 'stats:reviews',
    WISHLIST_STATS: 'stats:wishlist',
    CATEGORY_STATS: 'stats:categories',
    OVERVIEW_STATS: 'stats:overview',
  };

  // Cache TTL in seconds
  private static readonly CACHE_TTL = {
    USER_STATS: 300, // 5 minutes
    PRODUCT_STATS: 300, // 5 minutes
    PURCHASE_STATS: 180, // 3 minutes (more dynamic)
    REVIEW_STATS: 300, // 5 minutes
    WISHLIST_STATS: 300, // 5 minutes
    CATEGORY_STATS: 600, // 10 minutes (less dynamic)
    OVERVIEW_STATS: 240, // 4 minutes
  };

  async getUserStats(): Promise<any> {
    return this.cacheManager.get(StatisticsCacheService.CACHE_KEYS.USER_STATS);
  }

  async setUserStats(data: any): Promise<void> {
    await this.cacheManager.set(
      StatisticsCacheService.CACHE_KEYS.USER_STATS,
      data,
      StatisticsCacheService.CACHE_TTL.USER_STATS * 1000,
    );
  }

  async getProductStats(): Promise<any> {
    return this.cacheManager.get(StatisticsCacheService.CACHE_KEYS.PRODUCT_STATS);
  }

  async setProductStats(data: any): Promise<void> {
    await this.cacheManager.set(
      StatisticsCacheService.CACHE_KEYS.PRODUCT_STATS,
      data,
      StatisticsCacheService.CACHE_TTL.PRODUCT_STATS * 1000,
    );
  }

  async getPurchaseStats(): Promise<any> {
    return this.cacheManager.get(StatisticsCacheService.CACHE_KEYS.PURCHASE_STATS);
  }

  async setPurchaseStats(data: any): Promise<void> {
    await this.cacheManager.set(
      StatisticsCacheService.CACHE_KEYS.PURCHASE_STATS,
      data,
      StatisticsCacheService.CACHE_TTL.PURCHASE_STATS * 1000,
    );
  }

  async getReviewStats(): Promise<any> {
    return this.cacheManager.get(StatisticsCacheService.CACHE_KEYS.REVIEW_STATS);
  }

  async setReviewStats(data: any): Promise<void> {
    await this.cacheManager.set(
      StatisticsCacheService.CACHE_KEYS.REVIEW_STATS,
      data,
      StatisticsCacheService.CACHE_TTL.REVIEW_STATS * 1000,
    );
  }

  async getWishlistStats(): Promise<any> {
    return this.cacheManager.get(StatisticsCacheService.CACHE_KEYS.WISHLIST_STATS);
  }

  async setWishlistStats(data: any): Promise<void> {
    await this.cacheManager.set(
      StatisticsCacheService.CACHE_KEYS.WISHLIST_STATS,
      data,
      StatisticsCacheService.CACHE_TTL.WISHLIST_STATS * 1000,
    );
  }

  async getCategoryStats(): Promise<any> {
    return this.cacheManager.get(StatisticsCacheService.CACHE_KEYS.CATEGORY_STATS);
  }

  async setCategoryStats(data: any): Promise<void> {
    await this.cacheManager.set(
      StatisticsCacheService.CACHE_KEYS.CATEGORY_STATS,
      data,
      StatisticsCacheService.CACHE_TTL.CATEGORY_STATS * 1000,
    );
  }

  async getOverviewStats(): Promise<any> {
    return this.cacheManager.get(StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS);
  }

  async setOverviewStats(data: any): Promise<void> {
    await this.cacheManager.set(
      StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS,
      data,
      StatisticsCacheService.CACHE_TTL.OVERVIEW_STATS * 1000,
    );
  }

  // Utility methods
  async invalidateUserStats(): Promise<void> {
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.USER_STATS);
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS);
  }

  async invalidateProductStats(): Promise<void> {
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.PRODUCT_STATS);
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS);
  }

  async invalidatePurchaseStats(): Promise<void> {
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.PURCHASE_STATS);
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS);
  }

  async invalidateReviewStats(): Promise<void> {
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.REVIEW_STATS);
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS);
  }

  async invalidateWishlistStats(): Promise<void> {
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.WISHLIST_STATS);
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS);
  }

  async invalidateCategoryStats(): Promise<void> {
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.CATEGORY_STATS);
    await this.cacheManager.del(StatisticsCacheService.CACHE_KEYS.OVERVIEW_STATS);
  }

  async invalidateAllStats(): Promise<void> {
    const keys = Object.values(StatisticsCacheService.CACHE_KEYS);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  async getOrSetCache<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await factory();
    await this.cacheManager.set(key, data, ttl * 1000);
    return data;
  }
} 