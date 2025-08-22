import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type PromocodeActivationDocument = HydratedDocument<PromocodeActivation>

@Schema({ timestamps: true })
export class PromocodeActivation {
  @Prop({ required: true, ref: 'Promocode' })
  promocodeId: Types.ObjectId

  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId
}

export const PromocodeActivationSchema =
  SchemaFactory.createForClass(PromocodeActivation)
