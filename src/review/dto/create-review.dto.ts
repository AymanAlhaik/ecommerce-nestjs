import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../user/user.schema';
import { Product } from '../../product/product.schema';
import { IsMongoId, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {

  @IsOptional()
  @IsString()
  @MinLength(3)
  reviewText?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsMongoId()
  product: string;
}
