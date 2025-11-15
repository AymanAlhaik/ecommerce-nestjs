import {IsString, IsUrl, Length  } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsUrl()
  website:string
}
