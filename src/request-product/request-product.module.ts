import { Module } from '@nestjs/common';
import { RequestProductService } from './request-product.service';
import { RequestProductController } from './request-product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategory, subCategorySchema } from '../sub-category/sub-category.schema';
import { Category, categorySchema } from '../category/category.schema';
import { RequestProduct, requestProductSchema } from './request-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestProduct.name, schema: requestProductSchema },
      {
        name: Category.name,
        schema: categorySchema,
      },
    ]),
  ],
  controllers: [RequestProductController],
  providers: [RequestProductService],
})
export class RequestProductModule {}
