import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model, Types } from 'mongoose'
import { Action } from 'src/schemas/action.schema'
import { Prize } from 'src/schemas/prize.schema'
import { Reward } from 'src/schemas/rewards.schema'
import { Roulette } from 'src/schemas/roulette.schema'
import { User } from 'src/schemas/user.schema'
import { TasksService } from 'src/tasks/tasks.service'

@Injectable()
export class RoulettesService {
  constructor(
    private readonly tasksService: TasksService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(Action.name) private readonly actionModel: Model<Action>,
    @InjectModel(Roulette.name) private readonly rouletteModel: Model<Roulette>,
  ) {}

  async getRoulettes() {
    return await this.rouletteModel
      .find()
      .select('-weightMultipliers')
      .sort({ price: 1 })
  }

  async getRoulette(code: string) {
    const roulette = await this.rouletteModel
      .findOne({ code })
      .populate('prizes')
      .lean()

    if (!roulette) {
      throw new BadRequestException('Roulette not found')
    }

    const { weightMultipliers, ...data } = roulette
    return data
  }

  async spin({ userId, code }: { userId: Types.ObjectId; code: string }) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const roulette = await this.rouletteModel
        .findOne({ code })
        .populate<{ prizes: Prize[] }>('prizes')
        .session(session)
      if (!roulette) {
        throw new BadRequestException('Roulette not found')
      }

      const user = await this.userModel
        .findOne({ _id: userId, balance: { $gte: roulette.price } })
        .session(session)
      if (!user) {
        throw new BadRequestException('Insufficient balance')
      }

      const weights = roulette.prizes.map((prize) => {
        const baseWeight = 1 / Math.pow(prize.price.stars || 1, 1.5)
        const multiplier = roulette.weightMultipliers.find((multiplier) => {
          return multiplier.prizeCode === prize.code
        })

        const personalWeightMultiplier = user.weightMultiplier ?? 1
        const weightMultiplier = multiplier.weightMultiplier ?? 1

        if (prize.price.stars > roulette.price) {
          return baseWeight * personalWeightMultiplier * weightMultiplier
        }

        return baseWeight * weightMultiplier
      })
      const totalWeight = weights.reduce((acc, weight) => acc + weight, 0)

      let random = Math.random() * totalWeight
      let prize: Prize

      for (let i = 0; i < roulette.prizes.length; i++) {
        random -= weights[i]
        if (random <= 0) {
          prize = roulette.prizes[i]
          break
        }
      }

      // fallback
      if (!prize) {
        prize = roulette.prizes.reduce((cheapest, current) => {
          return current.price < cheapest.price ? current : cheapest
        })
      }

      let reward = new this.rewardModel({
        user: user._id,
        prizeCode: prize.code,
      })
      await reward.save({ session })
      await reward.populate('prize')

      await user
        .updateOne({ $inc: { balance: -roulette.price, spinCount: 1 } })
        .session(session)

      const action = new this.actionModel({
        type: 'spin',
        status: 'success',
        user: user._id,
        amount: roulette.price,
        prizeCode: prize.code,
      })
      await action.save({ session })

      await this.tasksService.create({
        userId: user._id,
        taskCode: 'spin',
        session,
      })

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
