import { Module } from '@nestjs/common'
import { BotService } from './bot.service'
import { User, UserSchema } from 'src/schemas/user.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { Action, ActionSchema } from 'src/schemas/action.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
