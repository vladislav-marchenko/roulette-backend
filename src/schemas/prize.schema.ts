import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type PrizeDocument = HydratedDocument<Prize>

@Schema({ timestamps: false })
export class Prize {
  @Prop({ unique: true, required: true })
  code: string

  @Prop({ unique: true, required: true })
  name: string

  @Prop({ type: { ton: Number, stars: Number }, required: true })
  price: {
    ton: number
    stars: number
  }

  @Prop({ default: 1 })
  weightMultiplier: number

  @Prop({ required: true })
  image: string

  @Prop({ required: true })
  lottie: string

  @Prop()
  telegramGiftId?: string
}

export const PrizeSchema = SchemaFactory.createForClass(Prize)
