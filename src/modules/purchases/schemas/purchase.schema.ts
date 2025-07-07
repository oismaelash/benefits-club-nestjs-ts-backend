import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ default: 'completed', enum: ['completed', 'cancelled', 'pending'] })
  status: string;

  @Prop({ default: Date.now })
  purchaseDate: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase); 