import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto, SignInDto, SignUpDto, VerifyCodeDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @docs Register
   * @param signUpDto {name, email, password}
   * @route POST ~/auth/sign-up
   * @canAcess public
   */
  @Post('sign-up')
  signUp(@Body() signUpDto:SignUpDto){
    return this.authService.signUp(signUpDto);
  }

  /**
   * @docs Register
   * @param singIn { email, password}
   * @route POST ~/auth/sign-in
   * @canAcess public
   */
  @Post('sign-in')
  signIn(@Body() singIn:SignInDto){
    return this.authService.signIn(singIn);
  }


  /**
   * @docs Reset the password (send verification code to passed email)
   * @param resetPassDto {email}
   * @route POST ~/auth/reset-password
   * @canAcess public
   */
  @Post('reset-password')
  resetPassword(@Body() resetPassDto:ResetPasswordDto){
    return this.authService.resetPassword(resetPassDto);
  }

  /**
   * @docs Verify Code (within 10 minutes)
   * @param verifyCodeDto {email, code}
   * @route POST ~/auth/verify-code
   * @canAcess public
   */
  @Post('verify-code')
  verifyCode(@Body() verifyCodeDto:VerifyCodeDto){
    return this.authService.verifyCode(verifyCodeDto);
  }

  /**
   * @docs change password (within 10 minutes)
   * @param signInDto {email, new Password}
   * @route POST ~/auth/change-password
   * @canAcess public
   */
  @Post('change-password')
  changePassword(@Body() signInDto:SignInDto){
   return this.authService.changePassword(signInDto);
  }
}
