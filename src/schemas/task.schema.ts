import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TaskDocument = HydratedDocument<Task>

@Schema({ timestamps: false, id: false })
export class Task {
  @Prop({
    required: true,
    unique: true,
    enum: [
      'invite_friend',
      'subscribe_channel',
      'daily_login',
      'deposit_hundred_stars',
      'spin',
    ],
  })
  code:
    | 'invite_friend'
    | 'subscribe_channel'
    | 'daily_login'
    | 'deposit_hundred_stars'
    | 'spin'

  @Prop({ required: true, enum: ['one_time', 'daily'] })
  type: 'one_time' | 'daily'

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  reward: number
}

export const TaskSchema = SchemaFactory.createForClass(Task)
