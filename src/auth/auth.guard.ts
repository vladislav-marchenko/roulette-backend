import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { isValid, parse } from '@telegram-apps/init-data-node'
import { Connection, Model } from 'mongoose'
import { User, UserDocument } from 'src/schemas/user.schema'
import { customAlphabet } from 'nanoid'
import { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const authorization = request.headers.authorization ?? ''
    const initData = authorization.replace('tma ', '')
    const referralCode = request.query?.ref

    const isInitDataValid = isValid(initData, process.env.TELEGRAM_BOT_TOKEN)
    if (!isInitDataValid) {
      throw new UnauthorizedException('Invalid init data')
    }

    const data = parse(initData, true).user
    if (!data.id) {
      throw new UnauthorizedException('Invalid init data')
    }

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      let user: UserDocument
      user = await this.userModel
        .findOne({ telegramId: data.id })
        .session(session)

      if (!user) {
        const userReferralCode = await this.generateReferralCode()
        const referrer = await this.userModel.findOne({ referralCode })

        user = new this.userModel({
          telegramId: data.id,
          referralCode: userReferralCode,
          invitedBy: referrer?._id,
        })

        await user.save({ session })
      }

      request['user'] = { ...user.toObject(), ...data }
      await session.commitTransaction()
      return true
    } catch (error) {
      await session.abortTransaction()
      return false
    } finally {
      await session.endSession()
    }
  }

  async generateReferralCode() {
    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const generate = customAlphabet(alphabet, 8)
    const code = generate()

    const exists = await this.userModel.exists({ referralCode: code })
    if (!!exists) return this.generateReferralCode()

    return code
  }
}
