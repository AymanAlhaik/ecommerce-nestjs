import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubCategory } from './sub-category.schema';
import { AppResponse } from '../utils/appResponse';
import { Category } from '../category/category.schema';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createSubCategoryDto: CreateSubCategoryDto) {
    const existing = await this.subCategoryModel.findOne({
      name: createSubCategoryDto.name,
    });
    if (existing) {
      throw new BadRequestException(
        'Sub-category with this name already exists',
      );
    }
    //check if category exists
    const isCategoryExists = await this.categoryModel.findById(
      createSubCategoryDto.category,
    );
    if (!isCategoryExists) {
      throw new BadRequestException('Category with specified id not exists');
    }
    const createdSubCat = new this.subCategoryModel(createSubCategoryDto);
    await createdSubCat.save();
    await createdSubCat.populate('category', 'name');
    return new AppResponse({ data: createdSubCat, status: 201 });
  }

  async findAll() {
    return await this.subCategoryModel
      .find()
      .populate('category', 'name') // populate category field, only return its name
      .exec();
  }

  async findOne(id: string) {
    const subCategory = await this.subCategoryModel
      .findById(id)
      .populate('category', 'name')
      .exec();

    if (!subCategory) {
      throw new NotFoundException('Sub-category not found');
    }
    return new AppResponse({ data: subCategory });
  }

  async update(id: string, updateSubCategoryDto: UpdateSubCategoryDto) {
    // If category is provided, validate it
    if (updateSubCategoryDto.category) {
      const categoryExists = await this.categoryModel.findById(
        updateSubCategoryDto.category,
      );
      if (!categoryExists) {
        throw new NotFoundException('Category not found');
      }
    }
    const updatedSubCategory = await this.subCategoryModel
      .findByIdAndUpdate(id, updateSubCategoryDto, {
        new: true,
        runValidators: true, // enforce schema validation
      })
      .populate('category', 'name')
      .exec();

    if (!updatedSubCategory) {
      throw new NotFoundException('Sub-category not found');
    }

    return new AppResponse({ data: updatedSubCategory });
  }

  async remove(id: string) {
    const deleted = await this.subCategoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Sub-category not found');
    }
    return new AppResponse();
  }
}
