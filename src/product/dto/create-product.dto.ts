import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
  IsMongoId,
  Min,
  Max,
  MinLength,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(3, 200)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsNumber()
  @Min(1)
  @Max(500)
  quantity: number;

  @IsString()
  @IsUrl()
  imageCover: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsNumber()
  @Min(1)
  @Max(20000)
  price: number;

  @IsOptional()
  @IsNumber()
  sold?:number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20000)
  priceAfterDiscount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  color?: string[];

  @IsMongoId()
  category: string;

  @IsOptional()
  @IsMongoId()
  subCategory?: string;

  @IsOptional()
  @IsMongoId()
  brand?: string;
}
