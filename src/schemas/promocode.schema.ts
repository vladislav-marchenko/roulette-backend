import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type PromocodeDocument = HydratedDocument<Promocode>

@Schema({ timestamps: true })
export class Promocode {
  @Prop({ required: true, enum: ['stars', 'spins'] })
  type: 'stars' | 'spins'

  @Prop({ unique: true, required: true })
  code: string

  @Prop({ required: true })
  amount: number

  @Prop()
  limit?: number

  @Prop()
  expiresAt?: Date
}

export const PromocodeSchema = SchemaFactory.createForClass(Promocode)
