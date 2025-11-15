import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { RequestProductService } from './request-product.service';
import { CreateRequestProductDto } from './dto/create-request-product.dto';
import { UpdateRequestProductDto } from './dto/update-request-product.dto';
import { UserPayload } from '../user/decorators/userPayload.decorator';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';

@Controller('request-products')
export class RequestProductController {
  constructor(private readonly requestProductService: RequestProductService) {}

  /**
   * @docs User Can create a product request
   * @param createRequestProductDto {titleNeed, details, quantity, category}
   * @param user Current authenticated user
   * @route POST ~/request-products
   * @canAcess [User]
   */
  @Post()
  @Roles(['user'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRequestProductDto: CreateRequestProductDto, @UserPayload() user: any) {
    return this.requestProductService.create(createRequestProductDto, user.id);
  }

  /**
   * @docs Admin Can retrieve all product requests
   * @param page Page number for pagination
   * @param limit Items per page
   * @route GET ~/request-products
   * @canAcess [Admin]
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.requestProductService.findAll(page, limit);
  }

  /**
   * @docs Admin Can retrieve a single product request by ID
   * @param id RequestProduct ID
   * @route GET ~/request-products/:id
   * @canAcess [Admin]
   */
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.requestProductService.findOne(id);
  }

  /**
   * @docs User Can retrieve their own product requests
   * @param user Current authenticated user
   * @param page Page number for pagination
   * @param limit Items per page
   * @route GET ~/request-products/my-requests
   * @canAcess [User]
   */
  @Get('my/my-requests')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  findUserRequests(@UserPayload() user: any, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.requestProductService.findUserRequests(user.id, page, limit);
  }

  /**
   * @docs User Can update their own product request
   * @param id RequestProduct ID
   * @param updateRequestProductDto Partial data to update
   * @param user Current authenticated user
   * @route PATCH ~/request-products/:id
   * @canAcess [User]
   */
  @Patch(':id')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateRequestProductDto: UpdateRequestProductDto, @UserPayload() user: any) {
    return this.requestProductService.update(id, updateRequestProductDto, user.id);
  }

  /**
   * @docs User Can delete their own product request
   * @param id RequestProduct ID
   * @param user Current authenticated user
   * @route DELETE ~/request-products/:id
   * @canAcess [User]
   */
  @Delete(':id')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @UserPayload() user: any) {
    return this.requestProductService.remove(id, user.id);
  }
}