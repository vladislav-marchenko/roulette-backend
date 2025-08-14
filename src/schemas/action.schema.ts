import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ActionDocument = HydratedDocument<Action>

@Schema({ timestamps: true })
export class Action {
  @Prop({ required: true, enum: ['deposit', 'withdraw', 'sell', 'win'] })
  type: 'deposit' | 'withdraw' | 'sell' | 'win'

  @Prop({ required: true })
  amount: number

  @Prop({ required: true, ref: 'User' })
  user: string

  @Prop()
  chargeId?: string

  @Prop()
  invoicePayload?: string

  @Prop()
  invoiceLink?: string

  @Prop({ ref: 'Prize' })
  prizeCode?: string

  @Prop({ required: true, enum: ['pending', 'success', 'failed'] })
  status: 'pending' | 'success' | 'failed'
}

export const ActionSchema = SchemaFactory.createForClass(Action)

ActionSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 15 * 60,
    partialFilterExpression: { status: 'pending' },
  },
)

ActionSchema.virtual('prize', {
  ref: 'Prize',
  localField: 'prizeCode',
  foreignField: 'code',
  justOne: true,
})

ActionSchema.set('toObject', { virtuals: true })
ActionSchema.set('toJSON', { virtuals: true })
