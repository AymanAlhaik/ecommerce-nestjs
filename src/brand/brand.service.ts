import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BrandDocument } from './brand.schema';
import { Model } from 'mongoose';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel('Brand') private readonly brandModel: Model<BrandDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    try {
      const createdBrand = await new this.brandModel(createBrandDto).save();
      return new AppResponse({ status: 201, data: createdBrand });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Brand with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    const allBrands =await this.brandModel.find().select('-__v').exec();
    return new AppResponse({ data: allBrands });
  }

  async findOne(id: string) {
    const brand = await this.brandModel.findById(id).select('-__v').exec();
    if (!brand) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }
    return new AppResponse({ data: brand });
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    try {
      const updatedBrand = await this.brandModel
        .findByIdAndUpdate(id, updateBrandDto, {
          new: true,
          runValidators: true,
        })
        .select('-__v')
        .exec();

      if (!updatedBrand) {
        throw new NotFoundException(`Brand with ID "${id}" not found`);
      }
      return new AppResponse({ status: 200, data: updatedBrand });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Brand with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const result = await this.brandModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }
    return new AppResponse();
  }
}
