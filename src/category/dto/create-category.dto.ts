import { IsOptional, IsString, IsUrl, Length, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(3,30)
  name: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}
