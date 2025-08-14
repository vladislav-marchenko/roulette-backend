import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type TransactionDocument = HydratedDocument<Transaction>

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, enum: ['deposit', 'withdraw', 'sell'] })
  type: 'deposit' | 'withdraw' | 'sell'

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
  prize?: string

  @Prop({ required: true, enum: ['pending', 'success', 'failed'] })
  status: 'pending' | 'success' | 'failed'
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)

TransactionSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 15 * 60,
    partialFilterExpression: { status: 'pending' },
  },
)
