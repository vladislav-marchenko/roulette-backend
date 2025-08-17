import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { Task, TaskSchema } from 'src/schemas/task.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { TaskAction, TaskActionSchema } from 'src/schemas/task-action.schema'
import { BotModule } from 'src/bot/bot.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskAction.name, schema: TaskActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BotModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
