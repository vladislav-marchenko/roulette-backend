import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type RewardDocument = HydratedDocument<Reward>

@Schema({
  timestamps: true,
  id: false,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Reward {
  @Prop({ required: true })
  prizeCode: string

  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId
}

export const RewardSchema = SchemaFactory.createForClass(Reward)

RewardSchema.virtual('prize', {
  ref: 'Prize',
  localField: 'prizeCode',
  foreignField: 'code',
  justOne: true,
})
