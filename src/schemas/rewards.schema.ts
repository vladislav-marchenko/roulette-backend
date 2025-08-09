import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type RewardDocument = HydratedDocument<Reward>

@Schema({ timestamps: true })
export class Reward {
  @Prop({ required: true })
  prizeKey: string

  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId
}

export const RewardSchema = SchemaFactory.createForClass(Reward)

RewardSchema.virtual('prize', {
  ref: 'Prize',
  localField: 'prizeKey',
  foreignField: 'key',
  justOne: true,
})

RewardSchema.set('toObject', { virtuals: true })
RewardSchema.set('toJSON', { virtuals: true })
