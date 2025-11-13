import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
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
}
