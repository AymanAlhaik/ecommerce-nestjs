import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UserPayload } from '../user/decorators/userPayload.decorator';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * @docs User Add product to cart
   * @param productId (path)
   * @param user (from JWT token)
   * @route POST ~/carts/:productId
   * @canAcess [user]
   */
  @Post(':productId')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  create(
    @UserPayload() user: any,
    @Param('productId', ParseObjectIdPipe) productId: string,
  ) {
    return this.cartService.create(user.id, productId);
  }

  /**
   * @docs Admin Get all carts
   * @route GET ~/carts
   * @canAcess [admin]
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAll(@Query() query: any) {
    return this.cartService.findAll(query);
  }

  /**
   * Get current user's cart with populated products
   * @param {any} user - Authenticated user object from JWT
   * @returns {Promise<AppResponse<Cart>>} Cart with populated product details
   * @access User only
   * @example GET ~/carts/my-cart
   */
  @Get('my-cart')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  getMyCart(@UserPayload() user: any) {
    return this.cartService.findOne(user.id);
  }

  /**
   * Apply coupon for current user
   * @param {any} user - Authenticated user object from JWT
   * @access User only
   * @example GET ~/carts/coupon/:couponName
   */
  @Post('coupon/:couponName')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  applyCoupon(
    @Param('couponName') couponName: string,
    @UserPayload() user: any) {
    return this.cartService.applyCoupon(user.id, couponName);
  }

  @Patch(':productId')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  update(
    @UserPayload() user: any,
    @Param('productId', ParseObjectIdPipe) productId: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.update(user.id, productId, updateCartDto);
  }

  @Delete(':productId')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  remove(@UserPayload() user: any, @Param('productId') productId: string) {
    return this.cartService.remove(user.id, productId);
  }
}
