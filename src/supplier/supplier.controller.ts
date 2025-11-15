import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';

@Controller('suppliers')
// @UseGuards(AdminGuard) // Uncomment when auth is implemented
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  /**
   * @docs Admin Can add a supplier
   * @param createSupplierDto {name, website?}
   * @route POST ~/suppliers
   * @canAcess [Admin]
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  /**
   * @docs Any one Can retrieve all suppliers
   * @route GET ~/suppliers
   * @canAcess [Public]
   */
  @Get()
  findAll() {
    return this.supplierService.findAll();
  }

  /**
   * @docs Any one Can retrieve a single supplier by ID
   * @param id Supplier ID
   * @route GET ~/suppliers/:id
   * @canAcess [Public]
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  /**
   * @docs Admin Can update a supplier
   * @param id Supplier ID
   * @param updateSupplierDto {name?, website?}
   * @route PATCH ~/suppliers/:id
   * @canAcess [Admin]
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  /**
   * @docs Admin Can delete a supplier
   * @param id Supplier ID
   * @route DELETE ~/suppliers/:id
   * @canAcess [Admin]
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}