import { Module } from '@nestjs/common'
import { RoulettesService } from './roulettes.service'
import { RoulettesController } from './roulettes.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { Reward, RewardSchema } from 'src/schemas/rewards.schema'
import { TasksModule } from 'src/tasks/tasks.module'
import { Action, ActionSchema } from 'src/schemas/action.schema'
import { Roulette, RouletteSchema } from 'src/schemas/roulette.schema'
import { Prize, PrizeSchema } from 'src/schemas/prize.schema'

@Module({
  imports: [
    TasksModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Roulette.name, schema: RouletteSchema },
      { name: Prize.name, schema: PrizeSchema },
    ]),
  ],
  controllers: [RoulettesController],
  providers: [RoulettesService],
})
export class RoulettesModule {}
