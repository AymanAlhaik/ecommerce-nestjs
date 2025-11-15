import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AppResponse } from '../utils/appResponse';
import { Category, CategoryDocument } from '../category/category.schema';
import { SubCategory } from '../sub-category/sub-category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<AppResponse<ProductDocument>> {
    const isExists = await this.productModel.findOne({
      title: createProductDto.title,
    });
    if (isExists) {
      throw new BadRequestException('Product already exists');
    }
    //check if category exists
    const category = await this.categoryModel.findById(
      createProductDto.category,
    );
    if (!category) {
      throw new NotFoundException('Category not exists');
    }

    //if subcategory provided, it should be exists
    if (createProductDto.subCategory) {
      const subCategory = await this.categoryModel.findById(
        createProductDto.subCategory,
      );
      if (!subCategory) {
        throw new NotFoundException('Subcategory not exists');
      }
    }
    const createdProduct = new this.productModel(createProductDto);
    const savedProduct = await createdProduct.save();

    return new AppResponse({
      status: 201,
      data: savedProduct,
    });
  }

  private parseQueryFilters(query: any): any {
    const filter: any = {};
    const numericFields = ['sold', 'price', 'ratingsAverage'];
    const operators = ['gte', 'gt', 'lte', 'lt'];

    for (const key in query) {
      // Skip non-filter params
      if (['page', 'limit', 'sort', 'fields', 'keyword'].includes(key))
        continue;

      // Handle bracket notation: price[gte]=100 -> { price: { $gte: 100 } }
      const match = key.match(/^(\w+)\[(gte|gt|lte|lt)\]$/);

      if (match) {
        const [, field, operator] = match;
        const value = parseFloat(query[key]);

        if (numericFields.includes(field) && !isNaN(value)) {
          if (!filter[field]) filter[field] = {};
          filter[field][`$${operator}`] = value;
        }
      } else if (key === 'category') {
        // Handle category as ObjectId string
        filter[key] = query[key];
      }
    }

    return filter;
  }

  async findAll(query: any): Promise<AppResponse<ProductDocument[]>> {
    // Extract pagination
    let page = parseInt(query.page) || 1;
    let limit = parseInt(query.limit) || 10;
    if (page <= 0) page = 1;
    if (limit <= 0) limit = 10;
    let skip = (page - 1) * limit;
    // Parse filters
    const filter = this.parseQueryFilters(query);

    // Handle keyword search
    if (query.keyword) {
      filter.$or = [
        { title: { $regex: query.keyword, $options: 'i' } },
        { description: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    // Handle sorting
    let sortOptions: any = {};
    if (query.sort) {
      const sortFields = query.sort.split(',');
      sortFields.forEach((field: string) => {
        if (field.startsWith('-')) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      sortOptions = { createdAt: -1 };
    }

    // Handle field selection
    let selectFields = '-__v';
    if (query.fields) {
      const fieldsArray = query.fields.split(',');
      selectFields = fieldsArray.join(' ');
    }

    // Execute query
    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .select(selectFields)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name')
        .populate('subCategory', 'name')
        .populate('brand', 'name')
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return new AppResponse({
      data: products,
      pagination: {
        totalItems: total,
        itemCount: products.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  }

  async findOne(id: string): Promise<AppResponse<ProductDocument>> {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('brand', 'name')
      .select('-__v')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return new AppResponse({ data: product });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<AppResponse<ProductDocument>> {
    //check if category exists
    if (updateProductDto.category) {
      const category = await this.categoryModel.findById(
        updateProductDto.category,
      );
      if (!category) {
        throw new NotFoundException('Category not exists');
      }
    }
    //check if usbcategory exists
    if (updateProductDto.subCategory) {
      const subCategory = await this.categoryModel.findById(
        updateProductDto.subCategory,
      );
      if (!subCategory) {
        throw new NotFoundException('Subcategory not exists');
      }
    }
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, {
        new: true,
        runValidators: true,
      })
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('brand', 'name')
      .select('-__v')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return new AppResponse({
      data: updatedProduct,
    });
  }

  async remove(id: string): Promise<AppResponse<void>> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return new AppResponse();
  }
}
