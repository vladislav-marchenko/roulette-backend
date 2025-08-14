import { Module } from '@nestjs/common'
import { RouletteService } from './roulette.service'
import { RouletteController } from './roulette.controller'
import { PrizesModule } from 'src/prizes/prizes.module'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { Reward, RewardSchema } from 'src/schemas/rewards.schema'
import { TasksModule } from 'src/tasks/tasks.module'
import { Action, ActionSchema } from 'src/schemas/action.schema'

@Module({
  imports: [
    PrizesModule,
    TasksModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
  ],
  controllers: [RouletteController],
  providers: [RouletteService],
})
export class RouletteModule {}
