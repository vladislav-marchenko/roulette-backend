import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Bot } from 'grammy'
import { Connection, Model, Types } from 'mongoose'
import { nanoid } from 'nanoid'
import { Transaction } from 'src/schemas/transaction.schema'
import { User } from 'src/schemas/user.schema'
import { BotContext } from 'src/types'

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot<BotContext>

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN)
  }

  async onModuleInit() {
    this.bot.use(async (ctx, next) => {
      if (ctx.from) {
        const telegramId = ctx.from.id
        const user = await this.userModel.findOne({ telegramId })
        if (user) ctx.user = user
      }

      await next()
    })

    this.bot.command('start', async (ctx) => {
      await ctx.reply('Welcome! Thanks for starting the bot.')
    })

    this.bot.on('pre_checkout_query', async (ctx) => {
      try {
        if (!ctx.user) {
          return await ctx.answerPreCheckoutQuery(false, {
            error_message: 'User not found. Payment cannot be processed.',
          })
        }

        const { currency } = ctx.preCheckoutQuery
        if (currency !== 'XTR') {
          return await ctx.answerPreCheckoutQuery(false, {
            error_message: 'Unsupported currency. Payment cannot be processed.',
          })
        }

        await ctx.answerPreCheckoutQuery(true)
      } catch (error) {
        console.error('Pre-checkout error: ', error)
        await ctx.answerPreCheckoutQuery(false, {
          error_message: 'Internal server error',
        })
      }
    })

    this.bot.on('message:successful_payment', async (ctx) => {
      const session = await this.connection.startSession()
      session.startTransaction()

      try {
        if (!ctx.user) {
          return await ctx.reply('User not found. Payment cannot be processed.')
        }

        const payment = ctx.message.successful_payment
        const {
          total_amount,
          currency,
          provider_payment_charge_id,
          invoice_payload,
        } = payment

        if (currency !== 'XTR') {
          return await ctx.reply('Unsupported currency.')
        }

        const transaction = await this.transactionModel.findOne({
          invoicePayload: invoice_payload,
          user: ctx.user._id,
          status: 'pending',
        })

        if (!transaction) {
          return await ctx.reply(
            'Transaction not found. Payment cannot be processed.',
          )
        }

        if (transaction.amount !== total_amount) {
          return await ctx.reply(
            'Payment amount does not match transaction amount. Payment cannot be processed.',
          )
        }

        await ctx.user
          .updateOne({ $inc: { balance: total_amount } })
          .session(session)

        if (Types.ObjectId.isValid(ctx.user.invitedBy)) {
          const referrer = await this.userModel.findById(ctx.user.invitedBy)
          if (!referrer) return

          await referrer
            .updateOne({ $inc: { balance: total_amount * 0.04 } })
            .session(session)
        }

        await transaction
          .updateOne({
            status: 'success',
            chargeId: provider_payment_charge_id,
          })
          .session(session)

        await session.commitTransaction()
        await ctx.reply('Payment successful!')
      } catch (error) {
        await session.abortTransaction()
        console.log('Payment error: ', error)
        await ctx.reply('An error occurred while processing your payment.')
      } finally {
        await session.endSession()
      }
    })

    this.bot.start()
    console.log('Telegram bot started')
  }

  async onModuleDestroy() {
    this.bot.stop()
    console.log('Telegram bot stopped')
  }

  async createInvoiceLink({
    userId,
    amount,
  }: {
    userId: Types.ObjectId
    amount: number
  }) {
    if (amount < 0) {
      throw new BadRequestException('Amount cannot be negative')
    }

    const payload = `${nanoid()}_${userId}_${amount}_${Date.now()}`
    const invoiceLink = await this.bot.api.createInvoiceLink(
      `Deposit ${amount} stars`,
      'Add stars to your account',
      payload,
      '',
      'XTR',
      [{ label: 'Stars', amount }],
    )

    await this.transactionModel.create({
      type: 'deposit',
      status: 'pending',
      invoicePayload: payload,
      invoiceLink,
      amount,
      user: userId,
    })

    return invoiceLink
  }
}
