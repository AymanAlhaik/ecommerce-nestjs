import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BrandDocument = HydratedDocument<Brand>;
@Schema({timestamps: true, versionKey: false})
export class Brand {
  @Prop({
    required: true,
    unique: true,
    type: String,
    min: [3, 'number must be at least 3 characters'],
    max: [100, 'number must be at most 30 characters'],
  })
  name: string;

  @Prop({ type: String })
  image?: string;

}
export const brandSchema = SchemaFactory.createForClass(Brand);
