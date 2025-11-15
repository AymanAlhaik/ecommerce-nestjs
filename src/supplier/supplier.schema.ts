import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SupplierDocument = HydratedDocument<Supplier>;
@Schema({timestamps: true, versionKey: false})
export class Supplier {
  @Prop({
    required: true,
    unique: true,
    type: String,
    min: [3, 'number must be at least 3 characters'],
    max: [100, 'number must be at most 30 characters'],
  })
  name: string;

  @Prop({type: String})
  website: string;
}
export const supplierSchema = SchemaFactory.createForClass(Supplier);
