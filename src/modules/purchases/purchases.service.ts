import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseFilterDto } from './dto/purchase-filter.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    // Verify user exists
    const user = await this.usersService.findOne(createPurchaseDto.user_id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify product exists and is active
    const product = await this.productsService.findOne(createPurchaseDto.product_id);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available for purchase');
    }

    // Create purchase
    const purchaseData = {
      user: new Types.ObjectId(createPurchaseDto.user_id),
      product: new Types.ObjectId(createPurchaseDto.product_id),
      price: product.price,
      status: 'completed',
      purchaseDate: new Date(),
    };

    const createdPurchase = new this.purchaseModel(purchaseData);
    const savedPurchase = await createdPurchase.save();

    // Update product purchase count
    await this.productsService.incrementPurchaseCount(createPurchaseDto.product_id);

    // Populate the purchase with user and product details
    return this.purchaseModel
      .findById(savedPurchase._id)
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .exec();
  }

  async findAll(filterDto?: PurchaseFilterDto): Promise<Purchase[]> {
    const query: any = {};

    // Apply user filter
    if (filterDto?.user_id) {
      query.user = new Types.ObjectId(filterDto.user_id);
    }

    return this.purchaseModel
      .find(query)
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchaseModel
      .findById(id)
      .populate('user', 'name email')
      .populate('product', 'name description price')
      .exec();

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  async remove(id: string): Promise<void> {
    const purchase = await this.purchaseModel.findById(id).exec();
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Only allow cancellation if purchase is not already cancelled
    if (purchase.status === 'cancelled') {
      throw new BadRequestException('Purchase is already cancelled');
    }

    // Update status to cancelled instead of deleting
    await this.purchaseModel.findByIdAndUpdate(id, { 
      status: 'cancelled',
      updatedAt: new Date()
    }).exec();
  }

  async findByUser(userId: string): Promise<Purchase[]> {
    return this.purchaseModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('product', 'name description price')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProduct(productId: string): Promise<Purchase[]> {
    return this.purchaseModel
      .find({ product: new Types.ObjectId(productId) })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTotalPurchases(): Promise<number> {
    return this.purchaseModel.countDocuments({ status: 'completed' }).exec();
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.purchaseModel.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
} 