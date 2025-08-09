import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PrizesService } from 'src/prizes/prizes.service'
import { RewardsService } from 'src/rewards/rewards.service'
import { Prize } from 'src/schemas/prize.schema'
import { User } from 'src/schemas/user.schema'
import { AuthRequest } from 'src/types'

@Injectable()
export class RouletteService {
  constructor(
    private readonly prizesService: PrizesService,
    private readonly rewardsService: RewardsService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async spin(user: AuthRequest['user'], price: number = 25) {
    if (user.balance < price) {
      throw new BadRequestException('Insufficient balance')
    }

    const prizes = await this.prizesService.findAll()

    const weights = prizes.map((prize) => {
      const baseWeight = 1 / Math.pow(prize.price || 1, 2)
      const multiplier = prize.weightMultiplier ?? 1

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

    const reward = await this.rewardsService.create({
      userId: user._id,
      prizeKey: prize.key,
    })

    await this.userModel.findByIdAndUpdate(user._id, {
      $inc: { spinCount: 1, balance: -price },
    })

    return await this.rewardsService.find(reward._id)
  }
}
