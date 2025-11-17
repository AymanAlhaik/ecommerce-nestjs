import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCartDto {
  @IsOptional()
  @IsNotEmpty()
  @Min(1)
  quantity?:number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;
}
