import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaxDocument = HydratedDocument<Tax>;
@Schema({timestamps: true, versionKey: false})
export class Tax {
  @Prop({
    type: Number,
    default: 0,
  })
  taxPrice: Number;

  @Prop({type: Number, default: 0})
  shippingPrice: Number;
}
export const taxSchema = SchemaFactory.createForClass(Tax);
