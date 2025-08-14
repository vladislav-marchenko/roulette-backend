import { Module } from '@nestjs/common'
import { User, UserSchema } from 'src/schemas/user.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { TasksModule } from 'src/tasks/tasks.module'
import { BotModule } from 'src/bot/bot.module'
import { Action, ActionSchema } from 'src/schemas/action.schema'
import { ActionsController } from './actions.controller'
import { ActionsService } from './actions.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Action.name, schema: ActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TasksModule,
    BotModule,
  ],
  controllers: [ActionsController],
  providers: [ActionsService],
})
export class ActionsModule {}
