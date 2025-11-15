import { IsDate, IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @Type(() => Date)
  @IsDate()
  expiryDate: Date;

  @IsNumber()
  @Min(1)
  @Max(100)
  discount: number;
}
