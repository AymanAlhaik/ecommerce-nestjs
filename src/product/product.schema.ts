import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from '../category/category.schema';
import { SubCategory } from '../sub-category/sub-category.schema';
import { Brand } from '../brand/brand.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({
    required: true,
    type: String,
    minlength: 3,
    maxlength: 200,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
    type: String,
    minlength: 20,
  })
  description: string;

  @Prop({
    required: true,
    type: Number,
    min: 1,
    max: 500,
    default: 1,
  })
  quantity: number;

  @Prop({
    required: true,
    type: String,
  })
  imageCover: string;

  @Prop({
    type: Array,
    default: [],
  })
  images: string[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  sold: number;

  @Prop({
    required: true,
    type: Number,
    min: 1,
    max: 20000,
  })
  price: number;

  @Prop({
    type: Number,
    min: 1,
    max: 20000,
    default: (c => c.price),
  })
  priceAfterDiscount?: number;

  @Prop({
    type: Array,
    default: [],
  })
  color: string[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Category.name,
    index: true,
  })
  category: Category;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: SubCategory.name,
    index: true,
  })
  subCategory?: SubCategory;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Brand.name,
    index: true,
  })
  brand?: Brand;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  })
  ratingsAverage: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  ratingsQuantity: number;
}

export const productSchema = SchemaFactory.createForClass(Product);

// Indexes for better query performance
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ title: 'text', description: 'text' });