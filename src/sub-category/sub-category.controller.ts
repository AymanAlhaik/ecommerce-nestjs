import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('sub-categories')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  /**
   * @route POST /sub-categories
   * @description Create a new sub-category.
   * @access Admin only
   * @param {CreateSubCategoryDto} createSubCategoryDto - Data for creating a sub-category
   * @returns {Promise<Object>} The created sub-category object
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoryService.create(createSubCategoryDto);
  }

  /**
   * @route GET /sub-categories
   * @description Retrieve all sub-categories.
   * @access Public
   * @returns {Promise<Array>} List of all sub-categories
   */
  @Get()
  findAll() {
    return this.subCategoryService.findAll();
  }

  /**
   * @route GET /sub-categories/:id
   * @description Retrieve a single sub-category by its ID.
   * @access Public
   * @param {string} id - The ID of the sub-category
   * @returns {Promise<Object>} The requested sub-category object
   */
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.subCategoryService.findOne(id);
  }

  /**
   * @route PATCH /sub-categories/:id
   * @description Update an existing sub-category by its ID.
   * @access Admin only
   * @param {string} id - The ID of the sub-category
   * @param {UpdateSubCategoryDto} updateSubCategoryDto - Data for updating the sub-category
   * @returns {Promise<Object>} The updated sub-category object
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    return this.subCategoryService.update(id, updateSubCategoryDto);
  }

  /**
   * @route DELETE /sub-categories/:id
   * @description Remove a sub-category by its ID.
   * @access Admin only
   * @param {string} id - The ID of the sub-category
   * @returns {Promise<Object>} Confirmation of deletion
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.subCategoryService.remove(id);
  }
}
