import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { ClientSession, Connection, Model, Types } from 'mongoose'
import { Prize } from 'src/schemas/prize.schema'
import { Reward } from 'src/schemas/rewards.schema'
import { User } from 'src/schemas/user.schema'

@Injectable()
export class RewardsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create({
    userId,
    prizeCode,
    session,
  }: {
    userId: Types.ObjectId
    prizeCode: string
    session?: ClientSession
  }) {
    const reward = new this.rewardModel({ user: userId, prizeCode })
    return await reward.save({ session })
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
    page = 1,
  }: {
    userId: Types.ObjectId
    limit?: number
    page?: number
  }) {
    const rewards = await this.rewardModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'prize',
        select: '-weightMultiplier -id',
      })
    const count = await this.rewardModel.countDocuments({ user: userId })

    return { rewards, hasNext: page * limit < count }
  }

  async sellById({
    userId,
    rewardId,
  }: {
    userId: Types.ObjectId
    rewardId: string
  }) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const reward = await this.rewardModel
        .findById(rewardId)
        .populate<{ prize: Prize }>('prize')
        .session(session)

      if (!reward) {
        throw new BadRequestException('Reward not found')
      }

      if (reward.user.toString() !== userId.toString()) {
        throw new BadRequestException('You are not the owner of this reward')
      }

      await reward.deleteOne({ session })

      const user = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $inc: { balance: reward.prize.price } },
          { new: true, session },
        )
        .select('-weightMultiplier')

      await session.commitTransaction()
      return user
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}
