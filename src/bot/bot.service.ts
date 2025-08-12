import { Injectable, OnModuleInit } from '@nestjs/common'
import { Bot } from 'grammy'

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot

  constructor() {
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN)
  }

  async onModuleInit() {
    this.bot.command('start', async (ctx) => {
      await ctx.reply('Welcome! Thanks for starting the bot.')
    })

    await this.bot.start()
  }

  async createInvoiceLink({
    userId,
    amount,
  }: {
    userId: string
    amount: number
  }) {
    const invoiceLink = await this.bot.api.createInvoiceLink(
      'Deposit',
      'Top up your balance',
      `${userId}_${Date.now()}`,
      '',
      'XTR',
      [{ label: 'Stars', amount }],
    )

    return invoiceLink
  }
}
