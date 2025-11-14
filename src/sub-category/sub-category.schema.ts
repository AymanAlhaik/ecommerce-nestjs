import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from '../category/category.schema';

export type SubCategoryDocument = HydratedDocument<SubCategory>;
@Schema({timestamps: true, versionKey: false})
export class SubCategory {
  @Prop({
    required: true,
    unique: true,
    type: String,
    min: [3, 'number must be at least 3 characters'],
    max: [30, 'number must be at most 30 characters'],
  })
  name: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: Category.name, required: true})
  category:string
}
export const subCategorySchema = SchemaFactory.createForClass(SubCategory);