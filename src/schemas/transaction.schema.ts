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
}

export const PrizeSchema = SchemaFactory.createForClass(Transaction)
