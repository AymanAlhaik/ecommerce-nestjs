import { IsEmail, IsNumberString, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(30, { message: 'Name must be at most 30 characters long' })
  name: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  password: string;
}

export class SignInDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  password: string;
}

export class ResetPasswordDto{
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}

export class VerifyCodeDto{
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNumberString()
  @MinLength(3, { message: 'Verification code must be at least 3 characters long' })
  code:string
}