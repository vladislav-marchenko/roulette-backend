import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type PrizeDocument = HydratedDocument<Prize>

@Schema({ timestamps: false })
export class Prize {
  @Prop({ unique: true, required: true })
  code: string

  @Prop({ unique: true, required: true })
  name: string

  @Prop({ required: true })
  price: number

  @Prop({ default: 1 })
  weightMultiplier: number

  @Prop({ required: true })
  image: string

  @Prop({ required: true })
  lottie: string
}

export const PrizeSchema = SchemaFactory.createForClass(Prize)
