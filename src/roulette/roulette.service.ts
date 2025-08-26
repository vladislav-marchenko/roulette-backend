import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model, Types } from 'mongoose'
import { PrizesService } from 'src/prizes/prizes.service'
import { Action } from 'src/schemas/action.schema'
import { Prize } from 'src/schemas/prize.schema'
import { Reward } from 'src/schemas/rewards.schema'
import { User } from 'src/schemas/user.schema'
import { TasksService } from 'src/tasks/tasks.service'

@Injectable()
export class RouletteService {
  constructor(
    private readonly prizesService: PrizesService,
    private readonly tasksService: TasksService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(Action.name) private readonly actionModel: Model<Action>,
  ) {}

  async spin(userId: Types.ObjectId, price: number = 25) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const user = await this.userModel
        .findOne({ _id: userId, balance: { $gte: price } })
        .session(session)
      if (!user) {
        throw new BadRequestException('Insufficient balance')
      }

      const prizes = await this.prizesService.findAll()
      if (!prizes.length) {
        throw new BadRequestException('Prizes not found')
      }

      const weights = prizes.map((prize) => {
        const baseWeight = 1 / Math.pow(prize.price || 1, 2.5)
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

      await user
        .updateOne({ $inc: { balance: -price, spinCount: 1 } })
        .session(session)

      const action = new this.actionModel({
        type: 'spin',
        status: 'success',
        user: user._id,
        amount: price,
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
