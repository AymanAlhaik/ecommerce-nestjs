import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;
@Schema({timestamps: true, versionKey: false})
export class Category{
  @Prop({
    required: true,
    unique: true,
    type: String,
    min: [3, 'number must be at least 3 characters'],
    max: [30, 'number must be at most 30 characters'],
  })
  name: string;

  @Prop({ type: String })
  image?: string;

}
export const categorySchema = SchemaFactory.createForClass(Category);