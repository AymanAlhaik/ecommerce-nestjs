import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  /**
   * @docs Admin Can add a brand
   * @param createBrandDto {name, image?}
   * @route POST ~/brands
   * @canAcess [Admin]
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }
  /**
   * @docs Anyone Can retrieve all brands
   * @route GET ~/brands
   * @canAcess [Public]
   */
  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  /**
   * @docs Anyone Can retrieve a single brand by ID
   * @param id Brand ID
   * @route GET ~/brands/:id
   * @canAcess [Public]
   */
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.brandService.findOne(id);
  }

  /**
   * @docs Admin Can update a brand
   * @param id Brand ID
   * @param updateBrandDto {name?, image?}
   * @route PATCH ~/brands/:id
   * @canAcess [Admin]
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  /**
   * @docs Admin Can delete a brand
   * @param id Brand ID
   * @route DELETE ~/brands/:id
   * @canAcess [Admin]
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.brandService.remove(id);
  }
}
