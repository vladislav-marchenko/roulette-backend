import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

@Injectable()
export class FragmentService implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}
  private readonly API_URL = process.env.FRAGMENT_API_URL
  private readonly API_KEY = process.env.FRAGMENT_API_KEY
  private readonly TELEGRAM_PHONE = process.env.TELEGRAM_PHONE
  private readonly WALLET_MNEMONICS = process.env.WALLET_MNEMONICS
  private JWT_TOKEN: string

  async onModuleInit() {
    this.JWT_TOKEN = await this.getToken()
  }

  async getToken() {
    const data = {
      api_key: this.API_KEY,
      phone_number: this.TELEGRAM_PHONE.replace('+', ''),
      mnemonics: this.WALLET_MNEMONICS.split(' '),
    }

    const headers = { 'Content-Type': 'application/json' }

    try {
      console.log(
        "Don't forget to accept fragment login request in your telegram account!",
      )
      const response = await firstValueFrom(
        this.httpService.post(`${this.API_URL}/auth/authenticate`, data, {
          headers,
        }),
      )

      if ('token' in response.data) return response.data.token
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response.data)
      }
    }
  }

  async sendStars({
    username,
    quantity,
    retryCount = 0,
  }: {
    username: string
    quantity: number
    retryCount?: number
  }) {
    const data = {
      quantity,
      username,
      show_sender: true,
    }

    const headers = {
      Authorization: `JWT ${this.JWT_TOKEN}`,
      'Content-Type': 'application/json',
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.API_URL}/order/stars`, data, {
          headers,
          timeout: 5 * 60 * 1000,
        }),
      )

      return response.data
    } catch (error: unknown) {
      if (!(error instanceof AxiosError)) {
        throw new InternalServerErrorException('Failed to send stars')
      }

      if (retryCount < 3) {
        this.JWT_TOKEN = await this.getToken()
        return await this.sendStars({
          username,
          quantity,
          retryCount: retryCount + 1,
        })
      }

      throw new BadGatewayException(
        'Failed to send stars due to internal API error.',
      )
    }
  }
}
