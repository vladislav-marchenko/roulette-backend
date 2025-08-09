import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isValid, parse } from '@telegram-apps/init-data-node'
import { Model } from 'mongoose'
import { User, UserDocument } from 'src/schemas/user.schema'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authorization = request.headers.authorization ?? ''
    const initData = authorization.replace('tma ', '')

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
      user = await this.userModel.create({ telegramId: data.id })
    }

    request['user'] = { ...user.toObject(), ...data }
    return true
  }
}
