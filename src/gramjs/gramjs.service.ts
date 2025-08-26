import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  BadRequestException,
} from '@nestjs/common'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { Api } from 'telegram'
import input from 'input'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as bigInt from 'big-integer'
import { Entity } from 'telegram/define'

@Injectable()
export class GramjsService implements OnModuleInit, OnModuleDestroy {
  private client: TelegramClient
  private sessionFilePath = path.join(process.cwd(), 'telegram-session.txt')

  async onModuleInit() {
    let sessionString = ''
    try {
      sessionString = await fs.readFile(this.sessionFilePath, 'utf-8')
    } catch (error) {
      console.log('No saved session found, starting new session.')
    }

    const stringSession = new StringSession(sessionString)
    this.client = new TelegramClient(
      stringSession,
      parseInt(process.env.API_ID),
      process.env.API_HASH,
      { connectionRetries: 5 },
    )

    await this.client.start({
      phoneNumber: async () => process.env.TELEGRAM_PHONE,
      password: async () => process.env.TELEGRAM_PASSWORD,
      phoneCode: async () => await input.text('Enter code: '),
      onError: (err) => console.log(err),
    })

    const newSessionString: unknown = this.client.session.save()
    if (typeof newSessionString === 'string') {
      await fs.writeFile(this.sessionFilePath, newSessionString)
    }

    console.log('GramJS client started')
  }

  async onModuleDestroy() {
    await this.client.disconnect()
    console.log('GramJS client stopped')
  }

  async sendGift({
    telegramId,
    username,
    giftId,
  }: {
    telegramId: number
    username: string
    giftId: string
  }) {
    const errorMessage =
      'Unable to send gift: user not found. Please set a username in Telegram or simply send any message to @giftica_support so we can access your ID.'

    let user: Entity
    try {
      if (username) {
        user = await this.client.getEntity(username)
      } else {
        user = await this.client.getEntity(telegramId)
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Could not find the input entity')
      ) {
        throw new BadRequestException(errorMessage)
      }

      throw error
    }

    if (!(user instanceof Api.User)) throw new BadRequestException(errorMessage)

    const invoice = new Api.InputInvoiceStarGift({
      peer: new Api.InputPeerUser({
        userId: user.id,
        accessHash: user.accessHash,
      }),
      giftId: bigInt(giftId),
    })

    const paymentForm = await this.client.invoke(
      new Api.payments.GetPaymentForm({ invoice }),
    )

    await this.client.invoke(
      new Api.payments.SendStarsForm({ invoice, formId: paymentForm.formId }),
    )
  }

  async getAvailableGifts() {
    const result = await this.client.invoke(new Api.payments.GetStarGifts({}))
    if (!(result instanceof Api.payments.StarGifts)) return

    return result.gifts.filter((gift) => !gift['soldOut'])
  }

  async getAccountGifts() {
    const result = await this.client.invoke(
      new Api.payments.GetSavedStarGifts({
        peer: new Api.InputPeerSelf(),
        offset: '0',
      }),
    )

    return result.gifts
  }
}
