import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * @docs Admin Can create a product
   * @param createProductDto {title, description, quantity, imageCover, price, category, ...}
   * @route POST ~/products
   * @canAcess [Admin]
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  /**
   * @docs User Can retrieve all products
   * @param query query strings
   * @route GET ~/products
   * @canAcess [User]
   */
  @Get()
  async findAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  /**
   * @docs User Can retrieve a single product by ID
   * @param id Product ID
   * @route GET ~/products/:id
   * @canAcess [User]
   */
  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productService.findOne(id);
  }

  /**
   * @docs Admin Can update a product
   * @param id Product ID
   * @param updateProductDto Partial product data
   * @route PATCH ~/products/:id
   * @canAcess [Admin]
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * @docs Admin Can delete a product
   * @param id Product ID
   * @route DELETE ~/products/:id
   * @canAcess [Admin]
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productService.remove(id);
  }
}
