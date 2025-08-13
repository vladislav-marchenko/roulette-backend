import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BotService } from 'src/bot/bot.service'
import { Transaction } from 'src/schemas/transaction.schema'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly botService: BotService,
  ) {}

  async findUserTransactions({
    userId,
    limit = 20,
    page = 1,
  }: {
    userId: Types.ObjectId
    limit?: number
    page?: number
  }) {
    const transactions = await this.transactionModel
      .find({ user: userId })
      .select('-invoicePayload -chargeId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    const count = await this.transactionModel.countDocuments({ user: userId })

    return { transactions, hasNext: page * limit < count }
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
