import { Prop } from '@nestjs/mongoose';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTaxDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPrice: Number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingPrice: Number;
}
