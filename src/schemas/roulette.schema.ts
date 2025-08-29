import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type RouletteDocument = HydratedDocument<Roulette>

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Roulette {
  @Prop({ required: true, unique: true })
  code: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  price: number

  @Prop({ required: true })
  image: string

  @Prop({ required: true })
  color: string

  @Prop({ required: true })
  weightMultipliers: { prizeCode: string; weightMultiplier: number }[]
}

export const RouletteSchema = SchemaFactory.createForClass(Roulette)

RouletteSchema.virtual('prizes', {
  ref: 'Prize',
  localField: 'weightMultipliers.prizeCode',
  foreignField: 'code',
  justOne: false,
})
