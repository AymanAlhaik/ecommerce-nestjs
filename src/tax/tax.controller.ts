import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TaxService } from './tax.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { AppResponse } from '../utils/appResponse';

@Controller('taxs')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  /**
   * @docs Admin Can create or update tax values
   * @param createTaxDto {taxPrice?, shippingPrice?}
   * @route POST ~/tax
   * @canAcess [Admin]
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaxDto: CreateTaxDto){
    return this.taxService.createOrUpdate(createTaxDto);
  }
  /**
   * @docs Admin Can retrieve tax values
   * @route GET ~/tax
   * @canAcess [Admin]
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  find() {
    return this.taxService.find();
  }
  /**
   * @docs Admin Can reset tax values to 0
   * @route DELETE ~/tax
   * @canAcess [Admin]
   */
  @Delete()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove() {
    return this.taxService.reset();
  }
}
