import { Module } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { RewardsController } from './rewards.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Reward, RewardSchema } from 'src/schemas/rewards.schema'
import { User, UserSchema } from 'src/schemas/user.schema'
import { TasksModule } from 'src/tasks/tasks.module'
import { Action, ActionSchema } from 'src/schemas/action.schema'
import { BotModule } from 'src/bot/bot.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: User.name, schema: UserSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
    TasksModule,
    BotModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
