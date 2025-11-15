import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;
@Schema({timestamps: true, versionKey: false})
export class Coupon{
  @Prop({
    required: true,
    unique: true,
    type: String,
    min: [3, 'number must be at least 3 characters'],
    max: [100, 'number must be at most 30 characters'],
  })
  name: string;

  @Prop({ type: String, required: true })
  expiryDate: Date;

  @Prop({ type: Number, required: true })
  discount: number;


}
export const couponSchema = SchemaFactory.createForClass(Coupon);