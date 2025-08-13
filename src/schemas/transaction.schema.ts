import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type TransactionDocument = HydratedDocument<Transaction>

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, enum: ['deposit', 'withdraw'] })
  type: 'deposit' | 'withdraw'

  @Prop({ required: true })
  amount: number

  @Prop({ required: true, ref: 'User' })
  user: string

  @Prop()
  chargeId?: string

  @Prop({ required: true, unique: true })
  invoicePayload: string

  @Prop({ required: true })
  invoiceLink: string

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
