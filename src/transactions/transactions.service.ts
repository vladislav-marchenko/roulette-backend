import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Queue } from 'bullmq'
import { Connection, Model, Types } from 'mongoose'
import { BotService } from 'src/bot/bot.service'
import { Action } from 'src/schemas/action.schema'
import { User } from 'src/schemas/user.schema'
import { AuthRequest } from 'src/types'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Action.name) private readonly actionsModel: Model<Action>,
    @InjectQueue('withdraws') private readonly withdrawsQueue: Queue,
    @InjectConnection() private readonly connection: Connection,
    private readonly botService: BotService,
  ) {}

  async deposit({
    userId,
    amount,
  }: {
    userId: Types.ObjectId
    amount: number
  }) {
    const invoiceLink = await this.botService.createInvoiceLink({
      userId,
      amount: Math.ceil(amount),
    })

    return { invoiceLink }
  }

  async withdraw({
    user,
    quantity,
  }: {
    user: AuthRequest['user']
    quantity: number
  }) {
    if (quantity > 5000) {
      throw new BadRequestException(
        'For security reasons the maximum withdrawal amount is 5000 stars',
      )
    }

    const commission = 0.1
    const quantityWithCommission = Math.floor(quantity * (1 - commission))

    if (quantityWithCommission < 50) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${Math.ceil(50 / (1 - commission))} stars`,
      )
    }

    if (!user.username) {
      throw new BadRequestException(
        'Unable to send stars: please set a username in your Telegram account so we can identify you',
      )
    }

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: user._id, balance: { $gte: quantity } },
        { $inc: { balance: -quantity } },
        { session, new: true },
      )

      if (!updatedUser) {
        throw new BadRequestException('Insufficient balance')
      }

      const withdrawsCount = await this.actionsModel
        .countDocuments({
          type: 'withdraw',
          user: user._id,
          status: 'success',
          createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
        })
        .session(session)

      if (withdrawsCount >= 3) {
        throw new BadRequestException(
          'For security reasons, you can make only 3 withdrawals per day',
        )
      }

      const action = new this.actionsModel({
        type: 'withdraw',
        amount: quantity,
        user: user._id,
        status: 'pending',
      })

      await this.withdrawsQueue.add('withdraws', {
        username: user.username,
        quantity: quantityWithCommission,
        actionId: action._id,
      })

      await action.save({ session })
      await session.commitTransaction()

      return action
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}
