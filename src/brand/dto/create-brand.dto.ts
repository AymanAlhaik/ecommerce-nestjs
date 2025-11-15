import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @Length(3,100)
  name: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}
