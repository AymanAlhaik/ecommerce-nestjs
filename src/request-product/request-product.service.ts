import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestProductDto } from './dto/create-request-product.dto';
import { UpdateRequestProductDto } from './dto/update-request-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  RequestProduct,
  RequestProductDocument,
} from './request-product.schema';
import { Model } from 'mongoose';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class RequestProductService {
  constructor(
    @InjectModel(RequestProduct.name)
    private requestProductModel: Model<RequestProductDocument>,
  ) {}

  async create(
    createRequestProductDto: CreateRequestProductDto,
    userId: string,
  ): Promise<AppResponse<RequestProductDocument>> {
    try {
      const createdRequest = new this.requestProductModel({
        ...createRequestProductDto,
        user: userId,
      });
      const savedRequest = await createdRequest.save();

      return new AppResponse({
        status: 201,
        data: savedRequest,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Request with this title already exists');
      }
      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<AppResponse<RequestProductDocument[]>> {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      this.requestProductModel
        .find()
        .populate('user', 'name email')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.requestProductModel.countDocuments(),
    ]);

    return new AppResponse({
      data: requests,
      pagination: {
        totalItems: total,
        itemCount: requests.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  }

  async findOne(id: string): Promise<AppResponse<RequestProductDocument>> {
    const request = await this.requestProductModel
      .findById(id)
      .populate('user', 'name email')
      .select('-__v')
      .exec();

    if (!request) {
      throw new NotFoundException(`RequestProduct with ID "${id}" not found`);
    }

    return new AppResponse({ data: request });
  }

  async findUserRequests(
    userId: string,
    page: number,
    limit: number,
  ): Promise<AppResponse<RequestProductDocument[]>> {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      this.requestProductModel
        .find({ user: userId })
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.requestProductModel.countDocuments({ user: userId }),
    ]);

    return new AppResponse({
      data: requests,
      pagination: {
        totalItems: total,
        itemCount: requests.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  }

  async update(
    id: string,
    updateRequestProductDto: UpdateRequestProductDto,
    userId: string,
  ): Promise<AppResponse<RequestProductDocument> | {}> {
    // Check ownership first
    const existingRequest = await this.requestProductModel.findById(id);
    if (!existingRequest) {
      throw new NotFoundException(`RequestProduct with ID "${id}" not found`);
    }

    if (existingRequest.user.toString() !== userId) {
      throw new ForbiddenException('You can only update your own requests');
    }

    try {
      const updatedRequest = await this.requestProductModel
        .findByIdAndUpdate(id, updateRequestProductDto, {
          new: true,
          runValidators: true,
        })
        .select('-__v')
        .exec();

      return new AppResponse({ data: updatedRequest });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Request with this title already exists');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<AppResponse<void>> {
    // Check ownership first
    const existingRequest = await this.requestProductModel.findById(id);
    if (!existingRequest) {
      throw new NotFoundException(`RequestProduct with ID "${id}" not found`);
    }

    if (existingRequest.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    const result = await this.requestProductModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`RequestProduct with ID "${id}" not found`);
    }
    return new AppResponse();
  }
}
