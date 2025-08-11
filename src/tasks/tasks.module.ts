import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { Task, TaskSchema } from 'src/schemas/task.schema'
import { MongooseModule } from '@nestjs/mongoose'
import {
  CompletedTask,
  CompletedTaskSchema,
} from 'src/schemas/completed-task.schema'
import { User, UserSchema } from 'src/schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: CompletedTask.name, schema: CompletedTaskSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
