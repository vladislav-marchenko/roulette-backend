import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BotService } from 'src/bot/bot.service'
import { Action } from 'src/schemas/action.schema'

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name)
    private readonly actionsModel: Model<Action>,
    private readonly botService: BotService,
  ) {}

  async findUserActions({
    userId,
    limit = 20,
    page = 1,
  }: {
    userId: Types.ObjectId
    limit?: number
    page?: number
  }) {
    const actions = await this.actionsModel
      .find({ user: userId })
      .select('-invoicePayload -chargeId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    const count = await this.actionsModel.countDocuments({ user: userId })

    return { actions, hasNext: page * limit < count }
  }

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

  async withdraw() {}
}
