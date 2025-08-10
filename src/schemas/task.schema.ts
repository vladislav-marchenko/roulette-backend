import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TaskDocument = HydratedDocument<Task>

@Schema({ timestamps: false, id: false })
export class Task {
  @Prop({ required: true, unique: true })
  code: string

  @Prop({ required: true })
  type: 'one_time' | 'daily'

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  reward: number
}

export const TaskSchema = SchemaFactory.createForClass(Task)
