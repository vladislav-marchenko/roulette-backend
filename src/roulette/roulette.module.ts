import { Module } from '@nestjs/common'
import { RouletteService } from './roulette.service'
import { RouletteController } from './roulette.controller'
import { PrizesModule } from 'src/prizes/prizes.module'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { Reward, RewardSchema } from 'src/schemas/rewards.schema'
import { TasksModule } from 'src/tasks/tasks.module'
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema'

@Module({
  imports: [
    PrizesModule,
    TasksModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
  ],
  controllers: [RouletteController],
  providers: [RouletteService],
})
export class RouletteModule {}
