import { Module } from '@nestjs/common'
import { RouletteService } from './roulette.service'
import { RouletteController } from './roulette.controller'
import { PrizesModule } from 'src/prizes/prizes.module'
import { UserModule } from 'src/user/user.module'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { RewardsModule } from 'src/rewards/rewards.module'
import { Reward } from 'src/schemas/rewards.schema'

@Module({
  imports: [
    PrizesModule,
    RewardsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Reward.name, schema: Reward },
    ]),
  ],
  controllers: [RouletteController],
  providers: [RouletteService],
})
export class RouletteModule {}
