import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'
import { PrizesService } from 'src/prizes/prizes.service'
import { RewardsService } from 'src/rewards/rewards.service'
import { Prize } from 'src/schemas/prize.schema'
import { Reward } from 'src/schemas/rewards.schema'
import { User } from 'src/schemas/user.schema'
import { AuthRequest } from 'src/types'

@Injectable()
export class RouletteService {
  constructor(
    private readonly prizesService: PrizesService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
  ) {}

  async spin(user: AuthRequest['user'], price: number = 25) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      if (user.balance < price) {
        throw new BadRequestException('Insufficient balance')
      }

      const prizes = await this.prizesService.findAll()

      const weights = prizes.map((prize) => {
        const baseWeight = 1 / Math.pow(prize.price || 1, 2)
        const multiplier = prize.weightMultiplier ?? 1

        if (prize.price > price) {
          return baseWeight * multiplier * user.weightMultiplier
        }

        return baseWeight * multiplier
      })
      const totalWeight = weights.reduce((acc, weight) => acc + weight, 0)

      let random = Math.random() * totalWeight
      let prize: Prize

      for (let i = 0; i < prizes.length; i++) {
        random -= weights[i]
        if (random <= 0) {
          prize = prizes[i]
          break
        }
      }

      // fallback
      if (!prize) {
        prize = prizes.reduce((cheapest, current) => {
          return current.price < cheapest.price ? current : cheapest
        })
      }

      let reward = new this.rewardModel({
        user: user._id,
        prizeCode: prize.code,
      })
      await reward.save({ session })
      await reward.populate('prize')

      await this.userModel.findByIdAndUpdate(
        user._id,
        { $inc: { spinCount: 1, balance: -price } },
        { session },
      )

      const referrer = await this.userModel.findById(user.invitedBy)
      if (referrer) {
        await referrer.updateOne(
          { $inc: { balance: price * 0.04 } },
          { session },
        )
      }

      await session.commitTransaction()
      return reward
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}
