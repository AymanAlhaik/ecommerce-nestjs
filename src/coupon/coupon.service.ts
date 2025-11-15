import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon } from './coupon.schema';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel('Coupon') private readonly couponModel: Model<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    // Validate expiry date
    if (new Date(createCouponDto.expiryDate) < new Date()) {
      throw new BadRequestException('Expiry date must be in the future');
    }
    try {
      const createdCoupon = await new this.couponModel(createCouponDto).save();
      return new AppResponse({ data: createdCoupon, status: 201 });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Coupon with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    const allCoupons = await this.couponModel
      .find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .exec();
    return new AppResponse({ data: allCoupons });
  }

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id).select('-__v').exec();
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }
    return new AppResponse({ data: coupon });
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    // Validate expiry date if provided
    if (
      updateCouponDto.expiryDate &&
      new Date(updateCouponDto.expiryDate) < new Date()
    ) {
      throw new BadRequestException('Expiry date must be in the future');
    }
    try {
      const updatedCoupon = await this.couponModel
        .findByIdAndUpdate(id, updateCouponDto, {
          new: true,
          runValidators: true,
        })
        .select('-__v')
        .exec();

      if (!updatedCoupon) {
        throw new NotFoundException(`Coupon with ID "${id}" not found`);
      }
      return new AppResponse({ data: updatedCoupon });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Coupon with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }
    return new AppResponse();
  }
}
