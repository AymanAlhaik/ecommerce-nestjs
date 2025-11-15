import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * @docs Admin Can add a coupon
   * @param createCouponDto {name, expiryDate, discount}
   * @route POST ~/coupons
   * @canAcess [Admin]
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  /**
   * @docs Admin Can retrieve all coupons
   * @route GET ~/coupons
   * @canAcess [Admin]
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAll() {
    return this.couponService.findAll();
  }

  /**
   * @docs Admin Can retrieve a single coupon by ID
   * @param id Coupon ID
   * @route GET ~/coupons/:id
   * @canAcess [Admin]
   */
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.couponService.findOne(id);
  }

  /**
   * @docs Admin Can update a coupon
   * @param id Coupon ID
   * @param updateCouponDto {name?, expiryDate?, discount?}
   * @route PATCH ~/coupons/:id
   * @canAcess [Admin]
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }
  /**
   * @docs Admin Can delete a coupon
   * @param id Coupon ID
   * @route DELETE ~/coupons/:id
   * @canAcess [Admin]
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.couponService.remove(id);
  }
}
