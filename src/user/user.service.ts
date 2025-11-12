import {
  BadRequestException,
  HttpException,
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
      active: createUserDto.active ?? true,
    };
    //{username, password, email, role = user, active=true}
    const createdUser = await this.userModel.create({
      ...createUserDto,
      ...props,
    });
    return new AppResponse({ status: 201, data: createdUser });
  }

  async findAll(query: any): Promise<AppResponse<User[]>> {
    const { page = 1, limit = 10, sort = 'desc', name, email, role } = query;

    if (Number.isNaN(Number(limit)) || limit <= 0) {
      throw new HttpException('invalid limit', 400);
    }
    if (Number.isNaN(Number(page)) || page <= 0) {
      throw new HttpException('invalid page', 400);
    }
    if (!['asc', 'desc'].includes(sort)) {
      throw new HttpException('invalid sort', 400);
    }

    const totalItems = await this.userModel.countDocuments({
      ...(name && { name: new RegExp(`^${name}$`, 'i') }),
      ...(email && { email: new RegExp(`^${email}$`, 'i') }),
      ...(role && { role: new RegExp(`^${role}$`, 'i') }),
    });

    const skip = (page - 1) * limit;
    const users = await this.userModel
      .find({
        ...(name && { name: new RegExp(name, 'i') }),
        ...(email && { email: new RegExp(email, 'i') }),
        ...(role && { role: new RegExp(`^${role}$`, 'i') }),
      })
      .skip(skip)
      .limit(limit)
      .sort({ name: sort })
      .select('-password -__v');

    return new AppResponse({
      data: users,
      pagination: {
        totalItems,
        itemCount: users.length,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    });

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
