import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isValid, parse } from '@telegram-apps/init-data-node'
import { Model, Types } from 'mongoose'
import { User, UserDocument } from 'src/schemas/user.schema'
import { customAlphabet } from 'nanoid'
import { Request } from 'express'
import { Query } from 'src/types'
import { TasksService } from 'src/tasks/tasks.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tasksService: TasksService,
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

    let user: UserDocument
    user = await this.userModel.findOne({ telegramId: data.id })
    if (!user) {
      const userReferralCode = await this.generateReferralCode()
      const referralUser = await this.userModel.findOne({ referralCode })

      const payload: Query = {
        telegramId: data.id,
        referralCode: userReferralCode,
      }

      if (referralUser) {
        payload.invitedBy = referralUser._id
        await this.completeReferralTask(referralUser._id)
      }

      user = await this.userModel.create(payload)
    }

    request['user'] = { ...user.toObject(), ...data }
    return true
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

  async completeReferralTask(referralUserId: Types.ObjectId) {
    await this.tasksService.create({
      taskCode: 'invite_friend',
      userId: referralUserId,
    })
  }
}
