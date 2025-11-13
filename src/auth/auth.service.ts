import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<any> {
    const user = await this.userModel.findOne({ email: signUpDto.email });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const hashedPass = await bcrypt.hash(signUpDto.password, 10);
    const props = {
      password:hashedPass,
      role: 'user',
      active: true,
    };
    const createdUser = await this.userModel.create({
      ...signUpDto,
      ...props,
    });
    const payload = {
      id: createdUser._id.toString(),
      email: createdUser.email,
      role: createdUser.role,
    };

    const { password, __v, ...safeUser } = createdUser.toObject();
    const token = await this.jwtService.signAsync(payload);
    const expiresIn = 60 * 60; //1h
    return new AppResponse({
      status: 201,
      data: {
        token,
        expiresAt: Date.now() + expiresIn * 1000, // frontend-friendly timestamp
        user: safeUser,
      },
    });
  }

  async signIn(signInDto: SignInDto): Promise<any> {
    const user = await this.userModel.findOne({ email: signInDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(signInDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 3. Build JWT payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const { password, __v, ...safeUser } = user.toObject();
    const token = await this.jwtService.signAsync(payload);

    const expiresIn = 60 * 60; //1h
    return new AppResponse({
      status: 200,
      data: {
        token,
        expiresAt: Date.now() + expiresIn * 1000,
        user: safeUser,
      },
    });
  }
}
