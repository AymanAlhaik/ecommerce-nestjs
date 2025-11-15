import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier, SupplierDocument } from './supplier.schema';
import { AppResponse } from '../utils/appResponse';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {}

  /**
   * @docs Creates a new supplier in the database
   * @param createSupplierDto Supplier data transfer object
   * @returns Promise<SupplierDocument> Created supplier
   * @throws ConflictException if supplier name already exists
   */
  async create(
    createSupplierDto: CreateSupplierDto,
  ): Promise<AppResponse<Supplier>> {
    try {
      const createdSupplier = await new this.supplierModel(
        createSupplierDto,
      ).save();
      return new AppResponse({ data: createdSupplier, status: 201 });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Supplier with this name already exists');
      }
      throw error;
    }
  }

  /**
   * @docs Retrieves all suppliers from database
   * @returns Promise<SupplierDocument[]> Array of suppliers
   */
  async findAll(): Promise<AppResponse<SupplierDocument[]>> {
    const allSuppliers = await this.supplierModel
      .find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .exec();
    return new AppResponse({ data: allSuppliers });
  }

  /**
   * @docs Retrieves a single supplier by ID
   * @param id Supplier ID
   * @returns Promise<SupplierDocument> Supplier document
   * @throws NotFoundException if supplier not found
   */
  async findOne(id: string): Promise<AppResponse<Supplier>> {
    const supplier = await this.supplierModel
      .findById(id)
      .select('-__v')
      .exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }
    return new AppResponse({data:supplier});
  }

  /**
   * @docs Updates an existing supplier
   * @param id Supplier ID
   * @param updateSupplierDto Partial supplier data to update
   * @returns Promise<SupplierDocument> Updated supplier
   * @throws NotFoundException if supplier not found
   * @throws ConflictException if supplier name already exists
   */
  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<AppResponse<Supplier>> {
    try {
      const updatedSupplier = await this.supplierModel
        .findByIdAndUpdate(id, updateSupplierDto, {
          new: true,
          runValidators: true,
        })
        .select('-__v')
        .exec();

      if (!updatedSupplier) {
        throw new NotFoundException(`Supplier with ID "${id}" not found`);
      }
      return new AppResponse({data:updatedSupplier});
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Supplier with this name already exists');
      }
      throw error;
    }
  }

  /**
   * @docs Deletes a supplier from database
   * @param id Supplier ID
   * @returns Promise<void>
   * @throws NotFoundException if supplier not found
   */
  async remove(id: string): Promise<AppResponse<void>> {
    const result = await this.supplierModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }
    return new AppResponse();
  }
}
