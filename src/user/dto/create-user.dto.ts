import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl, Max,
  MaxLength, Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(30, { message: 'Name must be at most 30 characters long' })
  name: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  password: string;

  @IsEnum(['user', 'admin'], { message: 'Role must be either user or admin' })
  @IsOptional()
  role: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, {message:'avatar must be a valid url'})
  avatar?: string;

  @IsOptional()
  @IsNumber({}, {message:'age must be a number' })
  @Min(18, { message: 'Age must be at least 18' })
  age?: number;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  @IsEnum([true, false], {message: 'active must be either true or false'})
  active?: boolean; // ✅ better as boolean, not string

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'verificationCode must be at least 6 characters long' })
  verificationCode?: string;

  @IsEnum(['male', 'female'], { message: 'Gender must be either male or female' })
  @IsOptional()
  gender: string;

}
