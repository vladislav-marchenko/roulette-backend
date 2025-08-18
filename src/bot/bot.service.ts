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
import { Action } from 'src/schemas/action.schema'
import { User } from 'src/schemas/user.schema'
import { TasksService } from 'src/tasks/tasks.service'
import { BotContext } from 'src/types'

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot<BotContext>

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Action.name)
    private readonly actionModel: Model<Action>,
    @InjectConnection() private readonly connection: Connection,
    private readonly tasksService: TasksService,
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

        const action = await this.actionModel.findOne({
          invoicePayload: invoice_payload,
          user: ctx.user._id,
          status: 'pending',
        })

        if (!action) {
          return await ctx.reply(
            'Transaction not found. Payment cannot be processed.',
          )
        }

        if (action.amount !== total_amount) {
          return await ctx.reply(
            'Payment amount does not match transaction amount. Payment cannot be processed.',
          )
        }

        await ctx.user
          .updateOne({ $inc: { balance: total_amount } })
          .session(session)

        if (Types.ObjectId.isValid(ctx.user.invitedBy)) {
          const referrer = await this.userModel.findById(ctx.user.invitedBy)
          if (referrer) {
            const amount = Math.floor(total_amount * 0.04)

            await referrer
              .updateOne({ $inc: { balance: amount } })
              .session(session)

            const action = new this.actionModel({
              type: 'referral',
              user: referrer._id,
              amount,
              status: 'success',
            })
            await action.save({ session })
          }
        }

        await action
          .updateOne({
            status: 'success',
            chargeId: provider_payment_charge_id,
          })
          .session(session)

        await this.tasksService.create({
          userId: ctx.user._id,
          taskCode: 'deposit_hundred_stars',
          session,
        })

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

    await this.actionModel.create({
      type: 'deposit',
      status: 'pending',
      invoicePayload: payload,
      invoiceLink,
      amount,
      user: userId,
    })

    return invoiceLink
  }

  async isUserSubscribed({
    userTelegramId,
    channelUsername,
  }: {
    userTelegramId: number
    channelUsername: string
  }) {
    try {
      const member = await this.bot.api.getChatMember(
        channelUsername,
        userTelegramId,
      )

      return !['left', 'kicked'].includes(member.status)
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
