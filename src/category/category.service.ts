import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (category) {
      throw new BadRequestException('Category already exists');
    }
    const newCategory = await this.categoryModel.create({
      ...createCategoryDto,
      name: createCategoryDto.name.toLowerCase(),
    });
    return new AppResponse({ data: newCategory, status: 201 });
  }

  async findAll(query: any) {
    const { name } = query;
    let allCategories = await this.categoryModel
      .find()
      .where('name', new RegExp(name.toLowerCase(), 'i'));
    return new AppResponse({ data: allCategories });
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return new AppResponse({ data: category });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (updateCategoryDto.name) {
      updateCategoryDto.name = updateCategoryDto.name.toLowerCase();
    }
    const isNameExists = await this.categoryModel.findOne({
      name: updateCategoryDto.name,
    });
    if (isNameExists) {
      throw new BadRequestException('This category name already exists');
    }
    const updatedCat = await this.categoryModel.findByIdAndUpdate(
      { _id: id },
      { $set: updateCategoryDto },
      { new: true },
    );
    return new AppResponse({ data: updatedCat });
  }

  async remove(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryModel.deleteOne({ _id: id });
    return new AppResponse();
  }
}
