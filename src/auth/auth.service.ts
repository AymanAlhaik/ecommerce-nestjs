import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyCodeDto,
} from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppResponse } from '../utils/appResponse';
import { MailerService } from '@nestjs-modules/mailer';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<any> {
    const user = await this.userModel.findOne({ email: signUpDto.email });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const hashedPass = await bcrypt.hash(signUpDto.password, 10);
    const props = {
      password: hashedPass,
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

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 3. Build JWT payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const { password, __v, verificationCode, address, gender, phoneNumber, age, ...safeUser} = user.toObject();
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

  async resetPassword(resetPassDto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: resetPassDto.email });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    //insert code in verificationCode filed for that document associated with the email
    await this.userModel.findByIdAndUpdate(user.id, { verificationCode: code });
    //send code to the email
    const message = `
    <div>
      <h1>Verification Code</h1>
      <p>use the following code to verify your account: <h3 style="color: red;font-weight: bold; text-align: center; font-size: 30px">${code}</h3></p>
      <h6 style="font-weight: bold">Ecommerce Application NestJs</h6>
    </div>
    `;
    this.mailService.sendMail({
      from: `Ecommerce Application NestJs <${process.env.EMAIL_HOST}>`,
      to: resetPassDto.email,
      subject: `Ecommerce Application NestJs - Rest Password`,
      html: message,
    });

    return new AppResponse({
      message: `success, code sent to ${resetPassDto.email}, you should use verification code within 10 minutes.`,
    });
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const user = await this.userModel
      .findOne({ email: verifyCodeDto.email })
      .select('verificationCode updatedAt')
      .exec();
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user?.verificationCode !== verifyCodeDto.code) {
      throw new BadRequestException('verification code not valid');
    }
    //extra check
    if(!Number(user?.verificationCode)) {
      throw new BadRequestException('verification code not valid');
    }
    const now = new Date();
    // @ts-ignore
    const updatedAt = user?.updatedAt; // Type-safe access
    if (!updatedAt) {
      throw new BadRequestException('Invalid timestamp');
    }
    const diffMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);

    if (diffMinutes > 10) {
      throw new BadRequestException('Verification code expired');
    }
    await this.userModel.findOneAndUpdate(
      { email: verifyCodeDto.email },
      { verificationCode: 'verified' },
    );
    return new AppResponse({
      message: 'you should use change password within 10 minutes',
    });
  }

  async changePassword(signInDto: SignInDto) {
    if (signInDto.password.length < 6) {
      throw new BadRequestException('Password should be at least 6 characters');
    }
    const user: User | null = await this.userModel.findOne({
      email: signInDto.email,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user?.verificationCode !== 'verified') {
      throw new BadRequestException(
        'Something went wrong, try reset password again',
      );
    }
    // 2. Check time (10 minutes)
    const now = new Date();
    // @ts-ignore
    const updatedAt = new Date(user?.updatedAt);
    const diffMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);
    if (diffMinutes > 10) {
      throw new BadRequestException(
        'Something went wrong, try reset password again',
      );
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(signInDto.password, 10);

    await this.userModel.findOneAndUpdate(
      { email: signInDto.email },
      {
        password: hashedPassword,
        verificationCode: 'changed',
      },
    );
    return new AppResponse({
      data: { message: 'success, password reset successfully, go to login' },
    });
  }
}
