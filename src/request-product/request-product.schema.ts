import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from '../category/category.schema';
import { User } from '../user/user.schema';

export type RequestProductDocument = HydratedDocument<RequestProduct>;

@Schema({ timestamps: true, versionKey: false })
export class RequestProduct {
  @Prop({
    required: true,
    unique: true,
    type: String,
    min: [3, 'number must be at least 3 characters'],
    max: [30, 'number must be at most 30 characters'],
  })
  titleNeed: string;
  @Prop({
    type: String,
    min: [5, 'number must be at least 3 characters'],
  })
  details: string;

  @Prop({
    type: Number,
    min: 1,
  })
  quantity: number;

  @Prop({ type: String })
  category: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: User.name, required: true })
  user: string;
}

export const requestProductSchema =
  SchemaFactory.createForClass(RequestProduct);
