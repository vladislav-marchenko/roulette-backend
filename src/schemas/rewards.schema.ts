import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type RewardDocument = HydratedDocument<Reward>

@Schema({ timestamps: true, id: false })
export class Reward {
  @Prop({ required: true })
  prizeCode: string

  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId

  @Prop({ default: false })
  locked: boolean
}

export const RewardSchema = SchemaFactory.createForClass(Reward)

RewardSchema.virtual('prize', {
  ref: 'Prize',
  localField: 'prizeCode',
  foreignField: 'code',
  justOne: true,
})

RewardSchema.set('toObject', { virtuals: true })
RewardSchema.set('toJSON', { virtuals: true })
