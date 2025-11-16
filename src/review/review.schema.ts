import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Product } from '../product/product.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, versionKey: false })
export class Review {
  @Prop({
    type: String,
    min: [3, 'review must be at least 3 characters'],
  })
  reviewText: string;

  @Prop({ type: Number, min: 1, max: 5, required: true})
  rating: number;

  @Prop({ type: mongoose.Types.ObjectId, ref: User.name, required: true })
  user: string;
  @Prop({ type: mongoose.Types.ObjectId, ref: Product.name, required: true, index:true })
  product: string;
}

export const reviewSchema = SchemaFactory.createForClass(Review);
// Add compound index for better query performance
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product
