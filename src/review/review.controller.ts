import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from '../user/decorators/roles.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { UserPayload } from '../user/decorators/userPayload.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * @docs User Can create a review for a product
   * @param createReviewDto {rating, reviewText?, product}
   * @param user Current authenticated user
   * @route POST ~/reviews
   * @canAcess [User]
   */
  @Post()
  @Roles(['user'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReviewDto: CreateReviewDto, @UserPayload() user: any) {
    return this.reviewService.create(createReviewDto, user.id);
  }

  /**
   * @docs Admin Can retrieve all reviews On All Products with pagination
   * @param page Page number for pagination
   * @param limit Items per page
   * @route GET ~/reviews
   * @canAcess [Admin]
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.reviewService.findAll(page, limit);
  }

  /**
   * @docs Admin Can retrieve a single review by ID
   * @param id Review ID
   * @route GET ~/reviews/:id
   * @canAcess [Admin]
   */
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.reviewService.findOne(id);
  }

  /**
   * @docs Any One Can retrieve reviews for a specific product with pagination
   * @param productId Product ID
   * @param page Page number
   * @param limit Items per page
   * @route GET ~/reviews/product/:productId
   * @canAcess [Public]
   */
  @Get('product/:productId')
  async findByProduct(
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.reviewService.findByProduct(productId, page, limit);
  }

  /**
   * @docs Admin Can retrieve reviews by a specific user with pagination
   * @param userId User ID
   * @param page Page number
   * @param limit Items per page
   * @route GET ~/reviews/user/:userId
   * @canAcess [Admin]
   */
  @Get('user/:userId')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async findByUser(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.reviewService.findByUser(userId, page, limit);
  }

  /**
   * @docs User Can update their own review
   * @param id Review ID
   * @param updateReviewDto {rating?, reviewText?, product?}
   * @param user Current authenticated user
   * @route PATCH ~/reviews/:id
   * @canAcess [User]
   */
  @Patch(':id')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateReviewDto: UpdateReviewDto, @UserPayload() user: any) {
    return this.reviewService.update(id, updateReviewDto, user.id);
  }

  /**
   * @docs User Can delete their own review
   * @param id Review ID
   * @param user Current authenticated user
   * @route DELETE ~/reviews/:id
   * @canAcess [User]
   */
  @Delete(':id')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @UserPayload() user: any) {
    return this.reviewService.remove(id, user.id);
  }
}