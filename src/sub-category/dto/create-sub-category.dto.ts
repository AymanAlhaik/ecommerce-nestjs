import { IsMongoId, IsString, Length } from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  @Length(3,30)
  name: string;

  @IsString()
  @IsMongoId()
  category:string
}
