import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Mongoose } from 'mongoose';
import { Product } from '../product/product.schema';
import { User } from '../user/user.schema';
import { Category } from '../category/category.schema';
import { Coupon } from '../coupon/coupon.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true, versionKey: false })
export class Cart {
  @Prop({
    type: [
      {
        productId: {
          required: true,
          type: mongoose.Schema.Types.ObjectId,
          ref: Product.name,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: {
          type: String,
          default: '',
        },
      },
    ],
  })
  cartItems: [
    {
      productId: string;
      quantity: number;
      color: string;
    },
  ];

  @Prop({ type: Number })
  totalPrice: number;

  @Prop({ type: Number })
  totalPriceAfterDiscount: number;

  @Prop({
    type: [
      {
        name: {
          type: String,
        },
        couponId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Coupon.name,
        },
      },
    ],
  })
  coupons: [{ name: string; couponId: string }];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: string;
}

export const cartSchema = SchemaFactory.createForClass(Cart);
