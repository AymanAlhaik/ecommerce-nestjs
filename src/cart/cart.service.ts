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
      const productActualPrice = this.getActualProductPrice(productToInsert);
      cart.totalPrice += productActualPrice;
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
        totalPrice: this.getActualProductPrice(productToInsert),
        user: userId,
      });
      return new AppResponse({ status: 201, data: newCart });
    }
  }

  private getActualProductPrice(product: Product): number {
    if(product.priceAfterDiscount){
      return product.price - product.priceAfterDiscount;
    }
    return  product.price;
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

  async findAll(query:any) {
    const {page= 1, limit= 10} = query;
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

  async findOne(userId: string) {
    const cart = await this.cartModel.findOne({ user: userId }).populate({
      path: 'cartItems.productId',
      model: Product.name,
      select: 'title price images color priceAfterDiscount',
      options:{lean:true}
    })
      .lean()
      .exec();

    if (!cart) {
      throw new NotFoundException('You do not have a cart');
    }
    return new AppResponse({data:cart});
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
      if(updateCartDto.quantity > product.quantity ) {
        throw new BadRequestException('Quantity is out of stock ');
      }
      //remove the price of this product from total price
      const productActualPrice =
        product.priceAfterDiscount == 0
          ? product.price
          : product.priceAfterDiscount!;
      cart.totalPrice -= productActualPrice * productFromCart.quantity;
      //calculate new price based on new quantity
      cart.totalPrice += updateCartDto.quantity * productActualPrice;
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

  async remove(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const productFromCart = this.isProductExistsInCart(productId, cart);
    if (!productFromCart.exists) {
      throw new NotFoundException('This product not in your cart');
    }
    const product = await this.getProduct(productId);
    // subtract product price from total price
    const productActualPrice = this.getActualProductPrice(product);
    cart.totalPrice -=
      productActualPrice * cart.cartItems[productFromCart.index].quantity;
    // remove product from cartItems
    cart.cartItems.splice(productFromCart.index, 1);
    //update cart
    cart.markModified('cartItems');
    const updatedCart = await cart.save();
    return new AppResponse({ data: updatedCart });
  }
}
