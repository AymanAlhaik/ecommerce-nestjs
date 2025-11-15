import { Injectable } from '@nestjs/common';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax, TaxDocument } from './tax.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class TaxService {
  private readonly SINGLETON_ID = 'tax-config';

  constructor(@InjectModel(Tax.name) private taxModel: Model<TaxDocument>) {}

  async createOrUpdate(createTaxDto: CreateTaxDto) {
    const tax = await this.taxModel.findOne({});
    //if no tax, create it
    if (!tax) {
      const createdTax = await this.taxModel.create(createTaxDto);
      return new AppResponse({ status: 201, data: createdTax });
    }
    //else update existing tax
    const updateTax = await this.taxModel.findOneAndUpdate({}, createTaxDto, {
      new: true,
    });
    return new AppResponse({ data: updateTax });
  }

  async find() {
    const tax = await this.taxModel.findOne({});
    return new AppResponse({ data: tax });
  }

  async reset() {
    await this.taxModel.findOneAndUpdate({}, { taxPrice: 0, shippingPrice: 0 });
    return new AppResponse();
  }
}
