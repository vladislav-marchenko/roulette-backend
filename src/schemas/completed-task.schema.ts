import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type CompletedTaskDocument = HydratedDocument<CompletedTask>

@Schema({ timestamps: true })
export class CompletedTask {
  @Prop({ required: true })
  taskCode: string

  @Prop({ required: true, ref: 'User' })
  user: string
}

export const CompletedTaskSchema = SchemaFactory.createForClass(CompletedTask)

CompletedTaskSchema.virtual('task', {
  ref: 'Task',
  localField: 'taskCode',
  foreignField: 'code',
  justOne: true,
})

CompletedTaskSchema.set('toObject', { virtuals: true })
CompletedTaskSchema.set('toJSON', { virtuals: true })
