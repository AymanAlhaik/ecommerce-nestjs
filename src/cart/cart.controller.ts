import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UserPayload } from '../user/decorators/userPayload.decorator';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}


  /**
   * @docs User Add product to cart
   * @param productId (path)
   * @param user (from JWT token)
   * @route POST ~/carts/:productId
   * @canAcess [user]
   */
  @Post(':productId')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  create(
    @UserPayload() user: any,
    @Param('productId', ParseObjectIdPipe) productId: string,
  ) {
    return this.cartService.create(user.id, productId);
  }

  /**
   * @docs Admin Get all carts
   * @route GET ~/carts
   * @canAcess [admin]
   */
  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
