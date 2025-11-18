import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, cartSchema } from './cart.schema';
import { Product, productSchema } from '../product/product.schema';
import { Coupon, couponSchema } from '../coupon/coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: cartSchema },
      { name: Product.name, schema: productSchema },
      { name: Coupon.name, schema: couponSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
