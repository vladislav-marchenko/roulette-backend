import { Module } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { RewardsController } from './rewards.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Reward, RewardSchema } from 'src/schemas/rewards.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
