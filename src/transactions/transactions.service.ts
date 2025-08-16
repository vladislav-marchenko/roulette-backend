import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BotService } from 'src/bot/bot.service'
import { FragmentService } from 'src/fragment/fragment.service'
import { User } from 'src/schemas/user.schema'
import { AuthRequest } from 'src/types'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly botService: BotService,
    private readonly fragmentService: FragmentService,
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
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: user._id, balance: { $gte: quantity } },
      { $inc: { balance: -quantity } },
      { new: true },
    )

    if (!updatedUser) {
      throw new BadRequestException('Insufficient balance')
    }

    return await this.fragmentService.sendStars({
      username: user.username,
      quantity,
    })
  }
}
