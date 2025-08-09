import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, immutable: true, required: true })
  telegramId: string

  @Prop({ default: 0 })
  balance: number

  @Prop({ default: 0 })
  spinCount: number

  @Prop({ type: Types.Decimal128, default: 1 })
  weightMultiplier: number
}

export const UserSchema = SchemaFactory.createForClass(User)
