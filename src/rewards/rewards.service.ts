import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Reward } from 'src/schemas/rewards.schema'

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
  ) {}

  async create({
    userId,
    prizeKey,
  }: {
    userId: Types.ObjectId
    prizeKey: string
  }) {
    return await this.rewardModel.create({ user: userId, prizeKey })
  }

  async findById(id: Types.ObjectId) {
    return await this.rewardModel.findById(id).populate({
      path: 'prize',
      select: '-weightMultiplier -id',
    })
  }

  async findByUserId({
    userId,
    limit = 20,
    offset = 0,
  }: {
    userId: Types.ObjectId
    limit?: number
    offset?: number
  }) {
    const rewards = await this.rewardModel
      .find({ user: userId })
      .skip(offset)
      .limit(limit)
      .populate({
        path: 'prize',
        select: '-weightMultiplier -id',
      })
    const count = await this.rewardModel.countDocuments({ user: userId })

    return { rewards, count }
  }
}
