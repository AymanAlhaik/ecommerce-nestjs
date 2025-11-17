import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './cart.schema';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class CartService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel('Cart') private readonly cartModel: Model<Cart>,
  ) {}

  async create(userId: string, productId: string) {
    const productToInsert = await this.getProduct(productId);
    //check the quantity
    if (productToInsert.quantity <= 0) {
      throw new BadRequestException('This product is out of stock');
    }
    const cart = await this.cartModel.findOne({ user: userId });
    //if user already has Cart
    if (cart) {
      //if product is already exists in the cart => increase its quantity
      const isProductExistBefore = this.isProductExistsInCart(productId, cart);
      cart.totalPrice += productToInsert.price;
      if (isProductExistBefore.exists) {
        cart.cartItems[isProductExistBefore.index].quantity += 1;
      } else {
        //if product is not exists in cart => add it
        cart.cartItems.push({
          productId: productId,
          quantity: 1,
          color: '',
        });
      }
      // Mark cartItems as modified (required for Mongoose arrays)
      cart.markModified('cartItems');
      const updatedCart = await cart.save();

      return new AppResponse({
        status: 200,
        message: isProductExistBefore.exists
          ? 'success, product quantity increased in cart'
          : 'success, new product added to cart',
        data: updatedCart,
      });
    }

    //if user don't have Cart, Creat it
    else {
      const newCart = await this.cartModel.create({
        cartItems: [{ productId, quantity: 1, color: '' }],
        totalPrice: productToInsert.price,
        user: userId,
      });
      return new AppResponse({ status: 201, data: newCart });
    }
  }

  private isProductExistsInCart(
    productId: string,
    cart: CartDocument,
  ): { exists: boolean; index: number } {
    let isProductExistBefore: { exists: boolean; index: number } = {
      exists: false,
      index: -1,
    };
    for (let i = 0; i < cart.cartItems.length; i++) {
      if (cart.cartItems[i].productId.toString() === productId.toString()) {
        isProductExistBefore = { exists: true, index: i };
        break;
      }
    }
    return isProductExistBefore;
  }

  private async getProduct(productId: string): Promise<Product> {
    const product: Product | null = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found.`);
    }
    return product;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [carts, total] = await Promise.all([
      this.cartModel
        .find()
        .populate('user', 'name email')
        .populate('cartItems.productId', 'title price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.cartModel.countDocuments(),
    ]);

    return new AppResponse({
      status: 200,
      message: 'Carts retrieved successfully',
      data: carts,
      pagination: {
        totalItems: total,
        itemCount: carts.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  async findByUser(userId: string) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate({
        path: 'cartItems.productId',
        select: 'title price images color',
      })
      .lean();

    if (!cart) {
      throw new NotFoundException('Cart not found for this user');
    }

    return new AppResponse({
      status: 200,
      message: 'User cart retrieved successfully',
      data: cart,
    });
  }

  async update(
    userId: string,
    productId: string,
    updateCartDto: UpdateCartDto,
  ) {
    const product = await this.getProduct(productId);
    const cart = await this.cartModel.findOne({ user: userId });
    //if user don't have cart, create it
    if (!cart) {
      return this.create(userId, productId);
    }
    const isProductToUpdateExists = this.isProductExistsInCart(productId, cart);
    if (!isProductToUpdateExists.exists) {
      return this.create(userId, productId);
    }
    //user has cart and product already exists
    const productFromCart = cart.cartItems[isProductToUpdateExists.index];
    if (updateCartDto.quantity) {
      //remove the price of this product from total price
      cart.totalPrice -= product.price * productFromCart.quantity;
      //calculate new price based on new quantity
      cart.totalPrice += updateCartDto.quantity * product.price;
      cart.cartItems[isProductToUpdateExists.index].quantity =
        updateCartDto.quantity;
    }
    updateCartDto.color
      ? (cart.cartItems[isProductToUpdateExists.index].color =
          updateCartDto.color)
      : null;
    cart.markModified('cartItems');
    const updatedCart = await cart.save();
    return new AppResponse({ data: updatedCart });
  }

  async remove(userId: string, cartId: string) {
    const cart = await this.cartModel.findById(cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own cart');
    }

    await this.cartModel.findByIdAndDelete(cartId);

    return new AppResponse();
  }
}
