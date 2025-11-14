import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  /**
   * @docs Admin Can add a category
   * @param createCategoryDto {name, image?}
   * @route POST ~/categories
   * @canAcess [Admin]
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);

  }

  /**
   * @docs any one can get all categories
   * @route GET ~/categories
   * @canAcess public
   */
  @Get()
  findAll(@Query() query: any) {
    return this.categoryService.findAll(query);
  }

  /**
   * @docs any one can get a category
   * @param id id of category
   * @route GET ~/categories/id
   * @canAcess public
   */
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  /**
   * @docs Admin Can update a category
   * @param id the id of category to update
   * @param updateCategoryDto {name?, image?}
   * @route PATCH ~/categories/id
   * @canAcess [Admin]
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * @docs Admin Can Delete a category
   * @param id id of category
   * @route DELETE ~/categories/id
   * @canAcess [Admin]
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
