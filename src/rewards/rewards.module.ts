import { Module } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { RewardsController } from './rewards.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Reward, RewardSchema } from 'src/schemas/rewards.schema'
import { User, UserSchema } from 'src/schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
