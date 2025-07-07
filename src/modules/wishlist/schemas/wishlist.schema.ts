import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ default: 'medium', enum: ['low', 'medium', 'high'] })
  priority: string;

  @Prop({ default: Date.now })
  addedAt: Date;

  @Prop({ default: false })
  isNotified: boolean; // For price drop notifications

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Create compound index for user + product to prevent duplicates
WishlistSchema.index({ user: 1, product: 1 }, { unique: true }); 