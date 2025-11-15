import { IsMongoId, IsNumber, IsString, Length, Min, MinLength } from 'class-validator';

export class CreateRequestProductDto {

  @IsString()
  @Length(3, 30)
  titleNeed: string;

  @IsString()
  @MinLength(5)
  details: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  category: string;
}
