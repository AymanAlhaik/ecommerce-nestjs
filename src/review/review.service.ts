import {
  Injectable,
  NotFoundException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './review.schema';
import { AppResponse } from '../utils/appResponse';
import { Product, ProductDocument } from '../product/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  /**
   * @docs Creates a new review in the database
   * @param createReviewDto Review data transfer object
   * @param userId Current user ID
   * @returns AppResponse with created review
   */
  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<AppResponse<ReviewDocument>> {
    //user can make only one rate on a product
    const review = await this.reviewModel.findOne({
      user: userId,
      product: createReviewDto.product,
    });
    if(review) {
      throw new BadRequestException('You have rated this product, you should update or delete this review');
    }
    const createdReview = new this.reviewModel({
      ...createReviewDto,
      user: userId,
    });
    const savedReview = await createdReview.save();
    //updating rating quantity and average
    await this.updateProductRating(createReviewDto.product);

    return new AppResponse({
      status: 201,
      data: savedReview,
    });
  }

  /**
   * @docs Retrieves all reviews with pagination (Admin only)
   * @param page Page number
   * @param limit Items per page
   * @returns AppResponse with paginated reviews
   */
  async findAll(
    page: number,
    limit: number,
  ): Promise<AppResponse<ReviewDocument[]>> {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find()
        .populate('user', 'name email')
        .populate('product', 'title')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(),
    ]);

    return new AppResponse({
      data: reviews,
      pagination: {
        totalItems: total,
        itemCount: reviews.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  }

  /**
   * @docs Retrieves a single review by ID (Admin only)
   * @param id Review ID
   * @returns AppResponse with review data
   * @throws NotFoundException if review not found
   */
  async findOne(id: string): Promise<AppResponse<ReviewDocument>> {
    const review = await this.reviewModel
      .findById(id)
      .populate('user', 'name email')
      .populate('product', 'title price')
      .select('-__v')
      .exec();

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return new AppResponse({ data: review });
  }

  /**
   * @docs Retrieves reviews for a specific product with pagination
   * @param productId Product ID
   * @param page Page number
   * @param limit Items per page
   * @returns AppResponse with paginated product reviews
   */
  async findByProduct(
    productId: string,
    page: number,
    limit: number,
  ): Promise<AppResponse<ReviewDocument[]>> {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ product: productId })
        .populate('user', 'name')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({ product: productId }),
    ]);

    return new AppResponse({
      data: reviews,
      pagination: {
        totalItems: total,
        itemCount: reviews.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  }

  /**
   * @docs Retrieves reviews by a specific user with pagination
   * @param userId User ID
   * @param page Page number
   * @param limit Items per page
   * @returns AppResponse with paginated user reviews
   */
  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<AppResponse<Review[]>> {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ user: userId.toString() })
        .populate('product', 'title')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({ user: userId }),
    ]);
    return new AppResponse({
      data: reviews,
      pagination: {
        totalItems: total,
        itemCount: reviews.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  }

  /**
   * @docs Updates user's own review
   * @param id Review ID
   * @param updateReviewDto Partial review data
   * @param userId Current user ID
   * @returns AppResponse with updated review
   * @throws NotFoundException if review not found
   * @throws ForbiddenException if user doesn't own the review
   */
  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<AppResponse<ReviewDocument> | {}> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    if (review.user.toString() !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, {
        new: true,
        runValidators: true,
      })
      .populate('user', 'name email')
      .populate('product', 'title')
      .select('-__v')
      .exec();

    //updating rating quantity and average
    await this.updateProductRating(review.product.toString());

    return new AppResponse({
      message: 'Review updated successfully',
      data: updatedReview,
    });
  }

  /**
   * @docs Deletes user's own review
   * @param id Review ID
   * @param userId Current user ID
   * @returns Promise<void>
   * @throws NotFoundException if review not found
   * @throws ForbiddenException if user doesn't own the review
   */
  async remove(id: string, userId: string): Promise<AppResponse<void>> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    if (review.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const productId = review.product.toString();
    const result = await this.reviewModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }
    //updating rating quantity and average
    await this.updateProductRating(review.product.toString());
    return new AppResponse();
  }
  /**
   * @private Updates product's average rating and quantity
   * @param productId Product ID to update
   */
  private async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.reviewModel.find({ product: productId }).exec();
    const ratingsQuantity = reviews.length;
    const ratingsAverage = ratingsQuantity > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingsQuantity
      : 0;

    await this.productModel.findByIdAndUpdate(productId, {
      ratingsAverage: Math.round(ratingsAverage * 10) / 10, // Round to 1 decimal
      ratingsQuantity
    }).exec();
  }
}
