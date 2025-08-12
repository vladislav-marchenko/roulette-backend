import { Injectable } from '@nestjs/common'
import { BotService } from 'src/bot/bot.service'

@Injectable()
export class TransactionsService {
  constructor(private readonly botService: BotService) {}

  async findUserTransactions() {}

  async deposit({ userId, amount }: { userId: string; amount: number }) {
    const invoiceLink = await this.botService.createInvoiceLink({
      userId,
      amount,
    })

    return { invoiceLink }
  }

  async withdraw() {}
}
