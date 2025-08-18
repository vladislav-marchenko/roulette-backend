import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Queue } from 'bullmq'
import { Model, Types } from 'mongoose'
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
      amount,
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
    const commission = 0.1
    const quantityWithCommission = Math.floor(quantity * (1 - commission))

    if (quantityWithCommission < 50) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${Math.ceil(50 / (1 - commission))} stars`,
      )
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: user._id, balance: { $gte: quantity } },
      { $inc: { balance: -quantity } },
      { new: true },
    )

    if (!updatedUser) {
      throw new BadRequestException('Insufficient balance')
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

    await action.save()
    return action
  }
}
