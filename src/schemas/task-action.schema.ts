import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TaskActionDocument = HydratedDocument<TaskAction>

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class TaskAction {
  @Prop({ required: true })
  taskCode: string

  @Prop({ required: true, enum: ['completed', 'claimed'] })
  type: 'completed' | 'claimed'

  @Prop({ required: true, ref: 'User' })
  user: Types.ObjectId
}

export const TaskActionSchema = SchemaFactory.createForClass(TaskAction)

TaskActionSchema.virtual('task', {
  ref: 'Task',
  localField: 'taskCode',
  foreignField: 'code',
  justOne: true,
})
