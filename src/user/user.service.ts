import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppResponse } from '../utils/appResponse';
import { App } from 'supertest/types';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<AppResponse<User>> {
    const user = await this.userModel.findOne({ email: createUserDto.email });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const password = await bcrypt.hash(createUserDto.password, 10);
    const props = {
      password,
      role: createUserDto.role ?? 'user',
      active:createUserDto.active ?? true
    };
    //{username, password, email, role = user, active=true}
    const createdUser = await this.userModel.create({
      ...createUserDto,
      ...props,
    });
    return new AppResponse({ status: 201, data: createdUser });
  }

  async findAll(): Promise<AppResponse<User[]>> {
    const allUsers = await this.userModel.find().select('-password -__v');
    return new AppResponse({ data: allUsers });
  }

  async findOne(id: string): Promise<AppResponse<User>> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new AppResponse({ data: user });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<AppResponse<User | null>> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let userToUpdate = {
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      userToUpdate = {
        ...userToUpdate,
        password: hashedPassword,
      };
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: userToUpdate },
      { new: true },
    );
    return new AppResponse({ data: updatedUser });
  }

  async remove(id: string): Promise<AppResponse<void>> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.findByIdAndDelete(id);
    return new AppResponse();
  }
}
