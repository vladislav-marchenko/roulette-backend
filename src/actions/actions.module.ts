import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TasksModule } from 'src/tasks/tasks.module'
import { Action, ActionSchema } from 'src/schemas/action.schema'
import { ActionsController } from './actions.controller'
import { ActionsService } from './actions.service'
import { User, UserSchema } from 'src/schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Action.name, schema: ActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TasksModule,
  ],
  controllers: [ActionsController],
  providers: [ActionsService],
})
export class ActionsModule {}
